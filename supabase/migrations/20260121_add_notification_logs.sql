-- Migration: Add notification logs table and update tasks table
-- Created: 2026-01-21
-- Purpose: Track email notifications sent for due tasks and add notification flag to tasks

-- 1. Create notification_logs table for audit trail
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('assignee', 'manager', 'admin')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    email_subject TEXT,
    resend_id TEXT, -- ID returned by Resend API
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add due_notification_sent column to tasks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'due_notification_sent'
    ) THEN
        ALTER TABLE tasks ADD COLUMN due_notification_sent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Add last_notification_date for tracking escalation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'last_notification_date'
    ) THEN
        ALTER TABLE tasks ADD COLUMN last_notification_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_task_id ON notification_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_notification ON tasks(due_notification_sent, due_date) WHERE due_notification_sent = FALSE;

-- 5. Enable Row Level Security
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for notification_logs
-- Admins and gestors can view all logs
CREATE POLICY "Admins and managers can view notification logs"
    ON notification_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.access_level IN ('admin', 'gestor')
        )
    );

-- Service role can insert logs (for Edge Function)
CREATE POLICY "Service role can insert notification logs"
    ON notification_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- 7. Create function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_sent BIGINT,
    total_failed BIGINT,
    success_rate NUMERIC,
    tasks_notified BIGINT,
    unique_recipients BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status = 'success') as total_sent,
        COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
            2
        ) as success_rate,
        COUNT(DISTINCT task_id) as tasks_notified,
        COUNT(DISTINCT recipient_email) as unique_recipients
    FROM notification_logs
    WHERE sent_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to check if task needs re-notification (escalation)
CREATE OR REPLACE FUNCTION should_renotify_task(task_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    task_record RECORD;
    days_overdue INTEGER;
BEGIN
    SELECT 
        due_date,
        due_notification_sent,
        last_notification_date,
        status
    INTO task_record
    FROM tasks
    WHERE id = task_id;
    
    -- Don't notify if task is completed or archived
    IF task_record.status IN ('Concluído', 'Arquivado') THEN
        RETURN FALSE;
    END IF;
    
    -- If never notified and overdue, notify
    IF NOT task_record.due_notification_sent AND task_record.due_date < NOW() THEN
        RETURN TRUE;
    END IF;
    
    -- Calculate days overdue
    days_overdue := EXTRACT(DAY FROM NOW() - task_record.due_date);
    
    -- Re-notify at 3, 7, 14, 30 days overdue if not notified in last 24h
    IF days_overdue IN (3, 7, 14, 30) AND 
       (task_record.last_notification_date IS NULL OR 
        task_record.last_notification_date < NOW() - INTERVAL '24 hours') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Add helpful comments
COMMENT ON TABLE notification_logs IS 'Audit trail for all email notifications sent by the system';
COMMENT ON COLUMN notification_logs.recipient_type IS 'Type of recipient: assignee (task owner), manager (team lead), or admin';
COMMENT ON COLUMN notification_logs.resend_id IS 'Unique ID returned by Resend API for tracking delivery';
COMMENT ON FUNCTION get_notification_stats IS 'Get aggregated statistics about notification delivery';
COMMENT ON FUNCTION should_renotify_task IS 'Check if a task should be re-notified based on escalation rules';
