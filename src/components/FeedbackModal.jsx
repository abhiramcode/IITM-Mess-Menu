import React, { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { MESSES } from "../api/constants";


const FeedbackModal = ({ isOpen, onClose }) => {
	const [formData, setFormData] = useState({
		type: "Website",
		subType: "Fix",
		description: "",
		contact: "",
	});
	const [status, setStatus] = useState("idle"); // idle, submitting, success, error

	if (!isOpen) return null;

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const newData = { ...prev, [name]: value };
			// Reset subType if type changes
			if (name === "type") {
				newData.subType = value === "Website" ? "Fix" : "A";
			}
			return newData;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setStatus("submitting");

		try {
			const res = await fetch("/api/submit-form", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			if (!res.ok) throw new Error("Failed to submit");
			
			setStatus("success");
			setTimeout(() => {
				onClose();
				setStatus("idle");
				setFormData({
					type: "Website",
					subType: "Fix",
					description: "",
					contact: "",
				});
			}, 2000);
		} catch (error) {
			console.error("Error submitting form:", error);
			setStatus("error");
		}
	};

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
			onClick={onClose}
		>
			<div 
				className="bg-bg border border-border rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[65vh]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-6 border-b border-border flex-shrink-0">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-muted hover:text-fg transition-colors"
						aria-label="Close"
					>
						<X size={24} />
					</button>
					<h2 className="text-2xl font-bold text-fg m-0 flex items-center gap-2">
						<MessageSquare className="text-primary" size={24} />
						Anonymous Feedback
					</h2>
				</div>

				<div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
					{status === "success" ? (
						<div className="text-center py-10">
							<div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-500 mb-4">
								<Send size={24} />
							</div>
							<h3 className="text-lg font-medium text-fg">Thank you!</h3>
							<p className="text-muted mt-2">Your feedback has been submitted successfully.</p>
						</div>
					) : (
						<form id="feedback-form" onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="form-group">
									<label htmlFor="type" className="form-label">Feedback Type</label>
									<select id="type" name="type" value={formData.type} onChange={handleInputChange} className="input cursor-pointer">
										<option value="Website">Website Related</option>
										<option value="Mess-Issue">Mess Issue</option>
										<option value="Mess-Fix">Mess Improvement</option>
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="subType" className="form-label">Specific Area</label>
									<select id="subType" name="subType" value={formData.subType} onChange={handleInputChange} className="input cursor-pointer">
										{formData.type === "Website" ? (
											<>
												<option value="New">New Feature / Bug Fix</option>
												<option value="Fix">Incorrect Menu Display</option>
												<option value="Other">Other</option>
											</>
										) : (
											<>
												{MESSES.map((mess) => (
													<option key={mess.value} value={mess.value}>
														{mess.label}
													</option>
												))}
											</>
										)}
									</select>
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="description" className="form-label">Description</label>
								<textarea required id="description" name="description" value={formData.description} onChange={handleInputChange} minLength={20} maxLength={200} className="input min-h-[100px] resize-y" placeholder="Please provide details..."></textarea>
								{/* <div className="text-sm text-gray-500 text-right"> */}
								<div className="text-sm text-gray-500 flex justify-between">
									{/* {formData.description.length} / 200 */}
									<span className="text-red-500">
									{formData.description.length > 0 && formData.description.length < 20 && "Minimum 20 characters required"}
									</span>
									<span>{formData.description.length} / 200</span>
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="contact" className="form-label">Contact (Optional)</label>
								<input type="text" id="contact" name="contact" value={formData.contact} onChange={handleInputChange} className="input" placeholder="Your Contact Info" />
							</div>

							{status === "error" && (
								<div className="text-red-500 text-sm mt-2">Failed to submit feedback. Please try again later.</div>
							)}
						</form>
					)}
				</div>

				{status !== "success" && (
					<div className="p-6 border-t border-border flex-shrink-0">
						<button 
							type="submit" 
							form="feedback-form"
							disabled={status === "submitting"}
							className="btn-primary w-full flex justify-center items-center gap-2"
						>
							{status === "submitting" ? (
								<span className="animate-pulse">Submitting...</span>
							) : (
								<>
									<Send size={18} />
									Submit Feedback
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default FeedbackModal;
