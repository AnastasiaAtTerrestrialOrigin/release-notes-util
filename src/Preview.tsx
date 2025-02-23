import ReactMarkdown from "react-markdown";
import './Preview.css';
interface PreviewProps {
    label?: string;
    children: React.ReactNode;
}

export const Preview: React.FC<PreviewProps> = ({ label, children }) => {
    const content = children?.toString() || '';
    return (
        <div className="form-group">
            { label && <label>{label}</label> }
            <div className="preview">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
};