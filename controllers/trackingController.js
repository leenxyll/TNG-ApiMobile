const { trackingPusher } = require('../config/pusher');
const trackingModel = require('../models/trackingModel'); // สำหรับ query DB
require('dotenv').config();

async function updateShippingStatus(invoiceCode, statusCode) {
    try {
        // ดึง BroadcastInvLineID ทั้งหมดที่เกี่ยวข้องกับ invoice นี้
        const lineResults = await trackingModel.findBroadCastByInvoice(invoiceCode);

        if (!lineResults || lineResults.length === 0) {
            console.log(`No BroadcastInvLineID found for invoice ${invoiceCode}`);
            return;
        }

        // วนลูปเพื่อส่ง event ไปยัง Pusher สำหรับแต่ละ LineID
        for (const row of lineResults) {
            const lineId = row.BroadcastInvLineID;

            await trackingPusher.trigger('tracking', 'shipment-update', {
                BroadcastInvSeq: statusCode,
                BroadcastInvInvoice: invoiceCode,
                BroadcastInvLineID: lineId
            });

            console.log(`Published shipment update: Invoice ${invoiceCode}, Status ${statusCode}, LineID ${lineId}`);
        }
    } catch (error) {
        console.error('Error publishing shipment update:', error);
    }
}

module.exports = {
    updateShippingStatus
};
