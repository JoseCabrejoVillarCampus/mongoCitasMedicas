import 'reflect-metadata';
import { plainToClass, classToPlain } from 'class-transformer';
import { DTO } from '../limit/token.js';
import {Parametros} from '../controllers/parametros.js';
import { Router } from "express";
import { validate } from 'class-validator';
const appMiddlewareUsuariosVerify = Router();
const appDTODataUsuarios = Router();
const appDTOParamUsuarios = Router();

appMiddlewareUsuariosVerify.use(async(req,res,next) => {
    if(!req.rateLimit) return;
    let {payload} = req.data;
    const{ iat, exp, ...newPayload } = payload;
    payload = newPayload;
    let clone = JSON.stringify(classToPlain(plainToClass(DTO("usuarios").class, {}, { ignoreDecorators: true })));
    let verify = clone === JSON.stringify(payload);
    console.log(payload);
    console.log(clone);
    req.data= undefined;
    if(!verify) res.status(406).send({status: 406, message: "No Autorizado"})
    next();
});
appDTODataUsuarios.use( async(req,res,next)=>{
    try {
        let data = plainToClass(DTO("usuarios").class, req.body);
        await validate(data);
        req.body = JSON.parse(JSON.stringify(data));
        req.data= undefined;
        next();
    } catch (error) {
        res.status(error.status).send(error)
    }
});
appDTOParamUsuarios.use("/:id", async (req, res, next)=>{
    try{
        let parametro = plainToClass(Parametros, req.params);
        await validate(parametro);
        next();
    }catch (error){
        res.status(error.status).send(error);
    }
});
export { 
    appMiddlewareUsuariosVerify,
    appDTODataUsuarios,
    appDTOParamUsuarios    
};