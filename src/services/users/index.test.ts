import { UserDetails } from "@/types/user";

export const mockUsers: UserDetails[] = [
    {
        id: 1,
        login: "tester",
        description: [{
            type: "main",
            content: "Hello world"
        }],
        date_created: "2025-01-01T00:00:00Z",
        date_ban: null,
        ban_count: 0,
        privacy: {
            games: true
        },
        role_id: 0,
        date_last_login: "2025-01-01T00:00:00Z",
        active: true,
        subscribers: 0
    },
    {
        id: 2,
        login: "noactive",
        description: [{
            type: "main",
            content: "No hello world"
        }],
        date_created: "2025-01-15T00:00:00Z",
        date_ban: null,
        ban_count: 0,
        privacy: {
            games: true
        },
        role_id: 0,
        date_last_login: "2025-01-01T00:00:00Z",
        active: false,
        subscribers: 10
    }
];

export const mockSubscribers = [
    {
        id: 1,
        target_id: 1,
        source_id: 2,
        target_type: "user",
        date_created: "2025-01-15T00:00:00Z"
    },
    {
        id: 2,
        target_id: 1,
        source_id: 2,
        target_type: "game",
        date_created: "2025-01-15T00:00:00Z"
    },
    {
        id: 3,
        target_id: 2,
        source_id: 1,
        target_type: "user",
        date_created: "2025-01-15T00:00:00Z"
    },
    {
        id: 4,
        target_id: 1,
        source_id: 3,
        target_type: "jam",
        date_created: "2025-01-15T00:00:00Z"
    }
];

export const mockDb = {
    query: async () => ({
        rows: mockUsers,
        rowCount: mockUsers.length
    })
}

export const mockDbSubscribers = {
    query: async() => ({
        rows: mockSubscribers,
        rowCount: mockSubscribers.length
    })
}