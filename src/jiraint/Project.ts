export interface AvatarUrls {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
}

export interface Project {
    id: string;
    key: string;
    name: string;
    self: string;
    projectTypeKey: string;
    simplified: boolean;
    style: 'classic' | 'next-gen';
    isPrivate: boolean;
    avatarUrls: AvatarUrls;
    entityId?: string;
    uuid?: string;
}