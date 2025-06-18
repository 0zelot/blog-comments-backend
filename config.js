export default {
    host: "0.0.0.0",
    port: 3001,
    baseUrl: "http://localhost:3001", // base url for your api, remember don't forget http or https
    domain: "localhost",
    secure: false, // true for https only (for prod)
    oauth: {
        secret: "some-random-cute-string",
        github: {
            id: "github_oauth_app_id",
            secret: "github_oauth_app_secret"
        }
    },
    smtp: {
        host: "smtp.example.com",
        port: 25,
        user: "no-reply@example.com",
        pass: "password",
        name: "Your cute blog"
    },
    commentAlerts: "admin@example.com",
    rateLimit: { // add, edit, delete
        cooldown: 1000 * 60 * 5, // 5 minutes
        interval: 1000 * 30 // 30 seconds
    },
    maxCommentCount: 3, // max top-level comments per user on single post
    adminUsers: [ ], // use numbers, not strings - example: [ 29740364 ] 
    bannedUsers: [ ] // ^
}
