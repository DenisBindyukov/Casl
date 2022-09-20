import {defineAbility} from "@casl/ability";

export type UserType = {
    id: string
    role: string
    isLoggedIn: boolean
}

export enum PermissionGroups {
    superAdmin = 'superAdmin',
    admin = 'admin',
    user = 'user',
    anonymous = 'anonymous'
}


export default (user: UserType) => defineAbility((can, cannot) => {
    switch (user.role) {
        case PermissionGroups.superAdmin:
            can('manage', 'all');
            break;
        case PermissionGroups.admin:
            can('manage', 'all');
            cannot(['update', 'create'], 'Todo');
            break;
        case PermissionGroups.user:
            can('read', 'Todo');

            if (user.isLoggedIn) {
                can('create', 'Todo')
                can(['update', 'delete'], 'Todo', {authorId: user.id});
            }
            break;

        default:
            cannot('manage', 'all');
    }
})