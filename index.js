import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = new express();
const ipLocal = "172.16.3.1";
const ipPublic = "222.253.79.38";
const portLocal = 3000;
const portPublic = 12113;

const db = new pg.Client({
    user: "postgres",
    host: "222.253.79.38",
    database: "KTXD_DB",
    password: "A@12345",
    idleTimeoutMillis: 999999999,
    connectionTimeoutMillis: 999999999,
    port: 12122
});
db.connect();



app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Show data khi truy cập vào trang chính
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * from assets_it");
        let assetList = [];
        result.rows.forEach((asset) => {
            assetList.push(asset);
        });
        res.render("index.ejs", {assets: assetList, total: assetList.length});
    } catch (err) {
        console.log(err)
    }
});


app.post("/search", async (req,res) => {
    try {
        const input = req.body.search;
        const result = await db.query("SELECT * from assets_it WHERE id = $1", [input]);
        const data = result.rows[0];
        res.render("resultSearch.ejs", {assets: data, total: data.length});
    } catch (err) {
        const input = req.body.search;
        console.log(`Mã tài sản ${input} không tồn tại`);
        res.redirect("/");
    }
});


//Show trang thêm tài sản
let newID, currentFull, finalID, randomID1, randomID2, convertMaplTSSangTen;

app.get("/new", async (req, res) => {
   
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth()+1;
    let currentDate = new Date().getDate();
    let currentHour = new Date().getHours();
    let currentMinute = new Date().getMinutes();
    let currentSecond = new Date().getSeconds();
    currentFull = currentYear +"-"+ currentMonth +"-"+ currentDate + " " + currentHour +":"+ currentMinute +":"+ currentSecond;

    // console.log(currentFull);

    res.render("insert.ejs", {IDnew: newID, currentfull: currentFull});
   
});

//Xử lý khi click submit trên trang thêm tài sản
app.post("/add" ,async (req, res) => {
        const slthem = req.body.slTSThem;
        for(i=0; i<slthem; i++){
            try {
             const getSelectIDfirst = req.body.plTS;

            if(getSelectIDfirst == 0){
                randomID1 = "01";
                const getSelectIDsecond = req.body.lTS;
                if(getSelectIDsecond == "Máy tính"){
                    randomID2 = "01";
                } else if(getSelectIDsecond == "Màn hình") {
                    randomID2 = "02";
                } else if(getSelectIDsecond == "Camera") {
                    randomID2 = "03";
                } else if(getSelectIDsecond == "Router") {
                    randomID2 = "04";
                } else if(getSelectIDsecond == "Switch") {
                    randomID2 = "05";
                } else if(getSelectIDsecond == "Máy in - Scan - Photo") {
                    randomID2 = "06";
                } else if(getSelectIDsecond == "Thiết bị khác") {
                    randomID2 = "07";
                }else if(getSelectIDsecond == "Firewall") {
                    randomID2 = "08";
                }
                
            finalID = randomID1 + randomID2;
            // console.log(finalID + randomID2 + getSelectIDsecond);
            } else if(getSelectIDfirst == 1) {
                randomID1 = "02";
                const getSelectIDsecond = req.body.lTS;
                if(getSelectIDsecond == "Bàn"){
                    randomID2 = "01";
                } else if(getSelectIDsecond == "Ghế") {
                    randomID2 = "02";
                } else if(getSelectIDsecond == "Tủ") {
                    randomID2 = "03";
                } else if(getSelectIDsecond == "Quạt trần") {
                    randomID2 = "04";
                }
                // console.log(getSelectIDsecond);
            finalID = randomID1 + randomID2;
            }
            // console.log(finalID);
            const result = await db.query("SELECT id FROM assets_it WHERE id LIKE $1 || '%' ORDER BY id DESC;",[finalID]);
            const data = result.rows[0];
            // const data = result.rows;
            // console.log(data);
            const number = parseInt(data.id)+1;
            newID = String('0'+ number);
            console.log("Mã tài sản mới tạo: " + newID + " | vào lúc: " + currentFull);

            // const idTaiSan = req.body.maTS;
            const tenTaiSan = req.body.tenTS;
            const trangThai = req.body.ttTS;
            const dvt = req.body.donviTinh;
            const phanloaiTS = req.body.plTS;
            const loaiTS = req.body.lTS;
            const viTri = req.body.vtTS;
            const ngaythang = currentFull;
            const tsCon = req.body.childAssets;
            
        
            
            if(phanloaiTS == 0){
                convertMaplTSSangTen = "Công nghệ thông tin";
            } else if (phanloaiTS == 1) {
                convertMaplTSSangTen= "Thiết bị văn phòng";
            }else if (phanloaiTS == 2) {
                convertMaplTSSangTen= "Hệ thống điện";
            }

            console.log(newID,"|", tenTaiSan,"|", dvt,"|", convertMaplTSSangTen,"|", loaiTS,"|", trangThai,"|", viTri,"|", ngaythang,"|", tsCon);
            await db.query("INSERT INTO assets_it (id, assets_name, unit, assets_root, assets_type, status, location, date_import, assets_child) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [newID, tenTaiSan, dvt, convertMaplTSSangTen, loaiTS, trangThai, viTri, ngaythang, tsCon]);
            } catch (err) 
            {
             console.log(err + " Vui lòng điền đủ thông tin");
             res.redirect("/new");
            }
        }
        res.redirect("/new");
        
    // try {
    //     const getSelectIDfirst = req.body.plTS;

    //     if(getSelectIDfirst == 0){
    //         randomID1 = "01";
    //         const getSelectIDsecond = req.body.lTS;
    //         if(getSelectIDsecond == "Máy tính"){
    //             randomID2 = "01";
    //         } else if(getSelectIDsecond == "Màn hình") {
    //             randomID2 = "02";
    //         } else if(getSelectIDsecond == "Camera") {
    //             randomID2 = "03";
    //         } else if(getSelectIDsecond == "Router") {
    //             randomID2 = "04";
    //         } else if(getSelectIDsecond == "Switch") {
    //             randomID2 = "05";
    //         } else if(getSelectIDsecond == "Máy in - Scan - Photo") {
    //             randomID2 = "06";
    //         } else if(getSelectIDsecond == "Thiết bị khác") {
    //             randomID2 = "07";
    //         }
            
    //        finalID = randomID1 + randomID2;
    //        console.log(finalID + randomID2 + getSelectIDsecond);
    //     } else if(getSelectIDfirst == 1) {
    //         randomID1 = "02";
    //         const getSelectIDsecond = req.body.lTS;
    //         if(getSelectIDsecond == "Bàn"){
    //             randomID2 = "01";
    //         } else if(getSelectIDsecond == "Ghế") {
    //             randomID2 = "02";
    //         } else if(getSelectIDsecond == "Tủ") {
    //             randomID2 = "03";
    //         } else if(getSelectIDsecond == "Quạt trần") {
    //             randomID2 = "04";
    //         }
    //         // console.log(getSelectIDsecond);
    //        finalID = randomID1 + randomID2;
    //     }
    //     // console.log(finalID);
    //     const result = await db.query("SELECT id FROM assets_it WHERE id LIKE $1 || '%' ORDER BY id DESC;",[finalID]);
    //     const data = result.rows[0];
    //     // const data = result.rows;
    //     // console.log(data);
    //     const number = parseInt(data.id)+1;
    //     newID = String('0'+ number);
    //     console.log("Mã tài sản mới tạo: " + newID + " | vào lúc: " + currentFull);

    //     // const idTaiSan = req.body.maTS;
    //     const tenTaiSan = req.body.tenTS;
    //     const trangThai = req.body.ttTS;
    //     const dvt = req.body.donviTinh;
    //     const phanloaiTS = req.body.plTS;
    //     const loaiTS = req.body.lTS;
    //     const viTri = req.body.vtTS;
    //     const ngaythang = currentFull;
    //     const tsCon = req.body.childAssets;
        
       
        
    //     if(phanloaiTS == 0){
    //         convertMaplTSSangTen = "Công nghệ thông tin";
    //     } else if (phanloaiTS == 1) {
    //         convertMaplTSSangTen= "Thiết bị văn phòng";
    //     }else if (phanloaiTS == 2) {
    //         convertMaplTSSangTen= "Hệ thống điện";
    //     }

    //     console.log(newID,"|", tenTaiSan,"|", dvt,"|", convertMaplTSSangTen,"|", loaiTS,"|", trangThai,"|", viTri,"|", ngaythang,"|", tsCon);
    //     await db.query("INSERT INTO assets_it (id, assets_name, unit, assets_root, assets_type, status, location, date_import, assets_child) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    //     [newID, tenTaiSan, dvt, convertMaplTSSangTen, loaiTS, trangThai, viTri, ngaythang, tsCon]);
    //     res.redirect("/");
    // } catch (err) {
    //     console.log(err + " Vui lòng điền đủ thông tin");
    //     res.redirect("/new");
    // }
});

app.post("/addon", async (req, res) => {
    try {
        const getAddOnID = (req.body.addonID)+"0001";
        await db.query("INSERT INTO assets_it (id, assets_name, unit, assets_root, assets_type, status, location, date_import, assets_child) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [getAddOnID, "Sample", "Sample", "Sample","Sample","Sample","Sample", currentFull, "Sample"]);
        console.log("Tạo thành công mã sample: " + getAddOnID);
        res.redirect("/new");
    } catch (err) {
        const getAddOnID = (req.body.addonID);
        if(getAddOnID == "") {
            console.log("Không được bỏ trống." );
            res.redirect("/new");
        } else {
            console.log("Mã "+ getAddOnID + " đã tồn tại." );
             res.redirect("/new");
        }
        
    }
   
});

app.get("/thongke", async (req, res) => {

    res.render("thongke.ejs", {message: "Hello"});
});

app.post("/thongke", async (req, res) => {
    try {
        const input = req.body.inputThongKe;
        const result = await db.query("SELECT * from assets_it WHERE location =$1",[input]);
        let assetList = [];
        result.rows.forEach((asset) => {
            assetList.push(asset);
        });
        res.render("resultThongKe.ejs", {location: input, assets: assetList, total: assetList.length})
    } catch (err) {
        console.log(err + `Vị trí  + ${input} +  không tồn tại`);
        res.redirect("/thongke");
    }
});

app.listen(portLocal, () => {
    console.log(`Server running on http://localhost:${portLocal} or http://${ipLocal}:${portLocal}`);
    console.log(`Server running on http://${ipPublic}:${portPublic}`);
});