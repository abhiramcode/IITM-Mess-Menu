import { Heart } from "lucide-react";
import { APP_NAME, APP_VERSION } from "../api/constants";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border mt-6 sm:mt-16 py-6">
			<div className="container mx-auto px-4 text-center text-muted">
				<p>
					&copy; {currentYear} {APP_NAME} {APP_VERSION}. All rights reserved.
				</p>
				<p className="text-sm mt-1 flex items-center justify-center gap-1.5">
					Made with
					<Heart className="inline-block fill-primary text-primary" size={16} />
					for the students.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
