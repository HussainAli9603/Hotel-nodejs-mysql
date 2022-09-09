const UserType = require("../models/UserType");

const initialize = async () => {
    await initializeUserTypes();
}

const initializeUserTypes = async () => {
    await UserType.sync();
    const CONSUMER_TYPE_DESCRIPTION = "Consumer";
    const ADMIN_TYPE_DESCRIPTION = "Admin";

    let consumerType = await UserType.findOne({where: {description: CONSUMER_TYPE_DESCRIPTION}});
    if (consumerType == null) {
        // Create new consumer type
        await UserType.create({description: CONSUMER_TYPE_DESCRIPTION});
        console.log("Created new consumer type");
    }

    let adminType = await UserType.findOne({where: {description: ADMIN_TYPE_DESCRIPTION}});
    if (adminType == null) {
        // Create new consumer type
        await UserType.create({description: ADMIN_TYPE_DESCRIPTION});
        console.log("Created new admin type");
    }
}

const getConsumerTypeId = async () => {
    return await UserType.findOne({where: {description: "Consumer"}}).id;
};

const getAdminTypeId = async () => {
    return await UserType.findOne({where: {description: "Admin"}}).id;
};

module.exports = {initialize, getConsumerTypeId, getAdminTypeId};