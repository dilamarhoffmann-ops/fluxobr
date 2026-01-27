
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { isImageFile } from '../../lib/faqUtils';

interface FAQMarkdownProps {
    content: string;
    onPreviewImage?: (url: string) => void;
}

export const FAQMarkdown: React.FC<FAQMarkdownProps> = ({ content, onPreviewImage }) => {
    return (
        <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-img:rounded-xl prose-img:shadow-md">
            <ReactMarkdown
                components={{
                    img: ({ node, ...props }) => (
                        <div className="my-4 flex flex-col items-center">
                            <img
                                {...props}
                                className="max-w-full rounded-xl shadow-lg border border-slate-100 cursor-zoom-in hover:scale-[1.01] transition-transform"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (props.src && onPreviewImage) onPreviewImage(props.src);
                                }}
                            />
                            {props.alt && <span className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">{props.alt}</span>}
                        </div>
                    ),
                    h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold text-indigo-900 mt-6 mb-4 border-b border-indigo-100 pb-2" />,
                    h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold text-indigo-800 mt-5 mb-3" />,
                    h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold text-indigo-700 mt-4 mb-2" />,
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-4 space-y-2" />,
                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-4 space-y-2" />,
                    li: ({ node, ...props }) => <li {...props} className="text-slate-700" />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote {...props} className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 my-4 italic rounded-r-lg text-indigo-900" />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
                            <table {...props} className="min-w-full divide-y divide-slate-200" />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th {...props} className="px-4 py-2 bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider" />,
                    td: ({ node, ...props }) => <td {...props} className="px-4 py-2 border-t border-slate-100 text-sm" />,
                    a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-800 transition-all" />
                    ),
                    p: ({ node, children, ...props }) => {
                        const content = React.Children.toArray(children).join('');
                        const hasQA = /(:?^|\s)(Q:|P:|A:|R:)/.test(content);

                        if (hasQA) {
                            const parts = content.split(/(Q:|P:|A:|R:)/);
                            return (
                                <p {...props} className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {parts.map((part, i) => {
                                        let displayPart = part;
                                        let className = '';

                                        if (part === 'Q:' || part === 'P:') {
                                            displayPart = 'P:';
                                            className = 'font-black text-indigo-600 italic mr-1';
                                        } else if (part === 'A:' || part === 'R:') {
                                            displayPart = 'R:';
                                            className = 'font-black text-emerald-600 italic mr-1 mt-3 inline-block';
                                        }

                                        return (
                                            <React.Fragment key={i}>
                                                {(part === 'A:' || part === 'R:') && <br />}
                                                <span className={className}>
                                                    {displayPart}
                                                </span>
                                            </React.Fragment>
                                        );
                                    })}
                                </p>
                            );
                        }
                        return <p {...props}>{children}</p>;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
