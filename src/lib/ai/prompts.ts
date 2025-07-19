/**
 * Replace variables in a prompt template
 */
export const formatPrompt = (
	template: string | undefined,
	variables: Record<string, string>,
): string => {
	if (!template) return "";

	let formatted = template;

	for (const [key, value] of Object.entries(variables)) {
		formatted = formatted.replace(new RegExp(`{{${key}}}`, "g"), value);
	}
	return formatted;
};
