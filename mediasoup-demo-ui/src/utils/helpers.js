const getUser = (list, value) => {
    return list.find((each) => each.id === value);
};

export {
    getUser
}