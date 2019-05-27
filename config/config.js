module.exports = {
    dbURL: "mongodb://mongo:27017/auth",
    AuthenticationList: [{
        method: "GET",
        url: "/auth/v1/validate/token"
    }, {
        method: "PUT",
        url: "/auth/v1/user/changePassword"
    }, {
        method: "GET",
        url: "/auth/v1/user/list"
    }, {
        method: "GET",
        url: "/auth/v1/user/role"
    }, {
        method: "PUT",
        url: "/auth/v1/user/role"
    }, {
        method: "DELETE",
        url: "/auth/v1/user/logout"
    }, {
        method: "DELETE",
        url: "/auth/v1/user/delete"
    }]
};