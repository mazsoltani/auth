module.exports = {
    dbURL: "mongodb://mongo:27017/auth",
    AuthenticationList: [{
        method: "PUT",
        url: "/auth/v1/user/changePassword"
    }, {
        method: "DELETE",
        url: "/auth/v1/user/logout"
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
        method: "GET",
        url: "/auth/v1/validate/token"
    }]
};