import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import { createUser, deleteUser, getUserById, getUsers, modifyUser } from "./lambda";

const db = new aws.dynamodb.Table("Users", {
    attributes: [
        { name: "user_id", type: "S" },
    ],
    hashKey: "user_id",
    billingMode: "PROVISIONED",
    deletionProtectionEnabled: false,
    readCapacity: 2,
    writeCapacity: 2,
});

const lambdaPrefix = "web-app";
const getUsersFunction = new aws.lambda.CallbackFunction(`${lambdaPrefix}-get-all-users`, {
    runtime: "nodejs14.x",
    callback: getUsers,
    environment: {
        variables: {
            TABLE_NAME: db.name,
        },
    },
})

const createUserFunction = new aws.lambda.CallbackFunction(`${lambdaPrefix}-create-user`, {
    runtime: "nodejs14.x",
    callback: createUser,
    environment: {
        variables: {
            TABLE_NAME: db.name,
        },
    },
})

const modifyUserFunction = new aws.lambda.CallbackFunction(`${lambdaPrefix}-modify-user`, {
    runtime: "nodejs14.x",
    callback: modifyUser,
    environment: {
        variables: {
            TABLE_NAME: db.name,
        },
    },
})

const deleteUserFunction = new aws.lambda.CallbackFunction(`${lambdaPrefix}-delete-user`, {
    runtime: "nodejs14.x",
    callback: deleteUser,
    environment: {
        variables: {
            TABLE_NAME: db.name,
        },
    },
})

const getUserByIdFunction = new aws.lambda.CallbackFunction(`${lambdaPrefix}-get-user-by-id`, {
    runtime: "nodejs14.x",
    callback: getUserById,
    environment: {
        variables: {
            TABLE_NAME: db.name,
        },
    },
})

const api = new apigateway.RestAPI("api", {
    routes: [
        { path: "/users", method: "GET", eventHandler: getUsersFunction },
        { path: "/users", method: "POST", eventHandler: createUserFunction },
        { path: "/users", method: "PUT", eventHandler: modifyUserFunction },
        { path: "/users/{user_id}", method: "DELETE", eventHandler: deleteUserFunction},
        { path: "/users/{user_id}", method: "GET", eventHandler: getUserByIdFunction},
    ]
});


export const url = api.url;
