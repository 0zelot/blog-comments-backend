export default (text) => {
    return text
        .replace(/[ \t]+/g, " ")
        .replace(/^[ ]+|[ ]+$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}