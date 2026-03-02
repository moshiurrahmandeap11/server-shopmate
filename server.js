import app from "./app.js";

app.get("/", (req, res) => {
    res.send("Server is running")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
})