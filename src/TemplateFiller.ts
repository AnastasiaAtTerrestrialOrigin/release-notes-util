export function extractMergeFields(template: string) {
    const mergeFields = new Map<string, string>();
    const regex = /\{(.*?)\}/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        mergeFields.set(match[1], match[1]);
    }
    return mergeFields;
}

export function fillTemplate(template: string, mergeFields: Map<string, string>) {
    return template.replace(/\{([^}]+)\}/g, (match, p1) => {
        return mergeFields.get(p1) || match;
    });
}

export default fillTemplate;