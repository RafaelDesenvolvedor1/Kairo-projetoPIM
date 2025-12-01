module.exports = app => {
    app.get('/', (req, res) => {
    // res.json({status: 'Estados Brasileiros'});
    res.send("api do projeto Kairo");
});
}