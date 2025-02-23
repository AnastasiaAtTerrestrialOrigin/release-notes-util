export function extractMergeFields(template: string) {
    if(!template) {
        return new Map<string, string>();
    }
    const mergeFields = new Map<string, string>();
    const regex = /\{(.*?)\}/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        mergeFields.set(match[1], "");
    }
    return mergeFields;
}

export function fillTemplate(template: string, mergeFields: Map<string, string>) {
    if(!template) {
        return template;
    }
    return template.replace(/\{([^}]+)\}/g, (match, p1) => {
        return mergeFields.get(p1) || match;
    });
}

export default fillTemplate;