"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var connection_1 = require("./connection");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var db, data, tmp, _i, _a, line, stmt, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, connection_1.DB.createDBConnection()];
                case 1:
                    db = _b.sent();
                    data = fs.readFileSync('../data/essential/CSEGs_CEGs.csv', 'utf-8');
                    tmp = [];
                    _i = 0, _a = data.split('\n');
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 10];
                    line = _a[_i];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 8, , 9]);
                    tmp = line.split('\t');
                    if (tmp.length < 3 || tmp[2].includes(';') || tmp[1] === "essentiality") {
                        return [3 /*break*/, 9];
                    }
                    return [4 /*yield*/, db.prepare("Insert or IGNORE into Gene VALUES (?1, ?2, ?3, ?4)")];
                case 4:
                    stmt = _b.sent();
                    return [4 /*yield*/, stmt.bind({
                            1: Number(tmp[2]),
                            2: tmp[0],
                            3: tmp[1],
                            4: 1
                        })];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, stmt.run()];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, stmt.finalize()];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _b.sent();
                    console.log(e_1);
                    console.log(tmp);
                    console.log(tmp.length);
                    console.log(Number(tmp[2]));
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10: return [4 /*yield*/, db.close()];
                case 11:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
/*
    const db = await DB.createDBConnection();
    await DB.beginTransaction(db);

    const stmt = await db.prepare('insert into Car values (?1, ?2, ?3)');
    await stmt.bind({
        1: req.body.licensePlate,
        2: req.body.model,
        3: req.body.owner
    });

    const operationResult = await stmt.run();
    if (operationResult.changes === 1) {
        await DB.commitTransaction(db);
        res.status(StatusCodes.CREATED);
    } else {
        await DB.rollbackTransaction(db);
        res.status(StatusCodes.BAD_REQUEST);
    }

    await stmt.finalize();
    await db.close();
* */ 
