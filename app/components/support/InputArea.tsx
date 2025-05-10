// components/support/InputArea.tsx
import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { FiPaperclip, FiCamera, FiMail, FiPlus } from "react-icons/fi";

const InputArea: React.FC<{
  activeTab: "quick" | "deep";
  subject: string;
  showSubjectInput: boolean;
  onSetSubject: (subject: string) => void;
  onSetShowSubjectInput: (show: boolean) => void;
  onSendMessage: (content: string, attachments?: string[]) => Promise<void>;
}> = ({
  activeTab,
  subject,
  showSubjectInput,
  onSetSubject,
  onSetShowSubjectInput,
  onSendMessage,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setUploadError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://upload.io/upload/basic", {
        method: "POST",
        headers: {
          Authorization: "Bearer public_W142hge6uvE3qJNBZQ3xWPPbR4k5",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload file. Please try again.");
      throw error;
    } finally {
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic validation
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError("File size should be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const captureScreenshot = () => {
    // Implement screenshot capture logic
    alert("Screenshot capture would be implemented here");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    let attachmentUrl = "";
    if (file) {
      try {
        attachmentUrl = await uploadFile(file);
      } catch {
        return; // Error already shown
      }
    }

    await onSendMessage(inputMessage, attachmentUrl ? [attachmentUrl] : []);
    setInputMessage("");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {showSubjectInput && (
        <div className="mb-2">
          <input
            type="text"
            value={subject}
            onChange={(e) => onSetSubject(e.target.value)}
            placeholder="Subject of your enquiry"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={() => onSetShowSubjectInput(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              activeTab === "quick"
                ? "Ask your question..."
                : "Describe your issue..."
            }
            rows={1}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {file && (
            <div className="mt-1">
              <div className="flex items-center text-xs text-gray-500">
                <FiPaperclip className="mr-1" />
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setUploadError(null);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={triggerFileInput}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
            title="Attach file"
          >
            <FiPaperclip />
          </button>
          <button
            type="button"
            onClick={captureScreenshot}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
            title="Capture screenshot"
          >
            <FiCamera />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          title="Send message"
        >
          <FiMail />
        </button>
      </div>

      {!showSubjectInput && activeTab === "deep" && (
        <button
          type="button"
          onClick={() => onSetShowSubjectInput(true)}
          className="flex items-center text-xs text-blue-500 hover:text-blue-700"
        >
          <FiPlus size={12} className="mr-1" />
          Add subject to your enquiry
        </button>
      )}
    </form>
  );
};

export default InputArea;
