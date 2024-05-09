import * as zarr from "../../src/zarr";
import fs from 'node:fs';

declare enum HTTPMethod {
    GET = "GET",
}


describe.skip("My test suite", () => {
    it("My test", async () => {

        const url =
            "https://its-live-data.s3.amazonaws.com/datacubes/v2/N70W040/ITS_LIVE_vel_EPSG3413_G0120_X-150000_Y-2150000.zarr";
        const store = new zarr.HTTPStore(url, { fetchOptions: {}, supportedMethods: ["GET" as HTTPMethod] });


        // const velArray = await zarr.openArray({
        //     store,
        //     path: "satellite_img1",
        //     mode: "r",
        // });

        const midDateArray = await zarr.openArray({
            store,
            path: "mid_date",
            mode: "r",
        });
        console.log("midDateArray", midDateArray.shape);


        const satellteZarr = await zarr.openArray({
            store,
            path: "satellite_img1",
            mode: "r",
        });

        const satelliteArr = await satellteZarr.get(null).then((res) => {
            if (typeof res === "number") {
                throw new Error("data is a number");
            }
            return res.data as Float64Array;
        });
        console.log("Bytelength of satellite Arr", satelliteArr.byteLength);
        const satelliteStrs: Array<string> = [];
        // I need to use byte offsets...
        for (let offset = 0; offset < satelliteArr.byteLength; offset += 8) {
            const eightBytes = satelliteArr.buffer.slice(offset, offset + 8);
            const uintArray = new Uint8Array(eightBytes);
            let str = "";
            for (const byte of uintArray) {
                const char = String.fromCharCode(byte);
                if (char !== "\u0000") {
                    str = str.concat(String.fromCharCode(byte));
                }
            }
            satelliteStrs.push(str);
        }
        console.log('satelliteStrs.length', satelliteStrs.length);

        fs.writeFileSync("./satellite_img1.json", JSON.stringify(satelliteStrs));

        // const str = String.fromCharCode.apply(null, satelliteArr);
        // console.log("str", str.slice(0, 100));
        // console.log("String length", str.length);

        // const actualChars = chars.filter((char) => char !== "\u0000");
        // console.log("actualChars length", actualChars.length);
        // fs.writeFileSync("./satellite_img1_actual.json", JSON.stringify(actualChars));

        // const satellites_dict = {
        //     '1A': ""
        // }

        expect(satellteZarr.shape).toEqual([1024, 1024]);
    });
});
