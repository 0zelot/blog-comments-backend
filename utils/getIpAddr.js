export default (req) => {
    return req.headers["cf-connecting-ip"] || "127.0.0.1";
}