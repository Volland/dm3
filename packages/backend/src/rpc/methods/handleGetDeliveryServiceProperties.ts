import { stringify } from 'dm3-lib/dist.backend';
import express from 'express';
import { getDeliveryServiceProperties } from '../../config/getDeliveryServiceProperties';

export function handleGetDeliveryServiceProperties(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) {
    const response = getDeliveryServiceProperties();

    if (!response) {
        req.app.locals.logger.error({
            method: 'RPC GET DELIVERY SERVICE PROPERTIES',
            error: 'No Delivery Service Properties Set',
        });
        return res.status(400).send({
            jsonrpc: '2.0',
            result: 'No Delivery Service Properties Set',
        });
    }

    return res
        .status(200)
        .send({ jsonrpc: '2.0', result: stringify(response) });
}
