const { faker } = require('@faker-js/faker');
const fakeCarreers = [
    "Ing. Informática", "Ing. en Computación", 
    "Lic. en Derecho", "Lic. en Administración", 
    "Ing. Industrial", "Ing. Electrónica", "Psicología"
]


getUsers = () => {
    //nombre, teléfono, dirección, cédula y licenciatura
    //TO DO: Retrieve users from database
    var response = [];
    for (var i = 0; i < 50; i++) {
        response.push({
            nombre: faker.name.findName(),
            telefono: faker.phone.phoneNumber(),
            direccion: faker.address.city(),
            cedula: faker.finance.account(),
            licenciatura: faker.helpers.randomize(fakeCarreers)
        })
    }
    return response;
}

getUser = (cedula) =>{
    //TO DO: find by cedula
    let response = {
        nombre: faker.name.findName(),
        telefono: faker.phone.phoneNumber(),
        direccion: faker.address.city(),
        cedula,
        licenciatura: faker.helpers.randomize(fakeCarreers)
    }
    return response;
}

saveUser = (user) =>{
    //TO DO: Save user into database
    let response ={
        statusCode: 200,
        body: "Saved succesfully"
    }
    return response;
}

updateUser = (user) =>{
    //TO DO: Find user in database by cedula
    //TO DO: Save changes into database
    let response ={
        statusCode: 200,
        body: "Updated succesfully"
    }
    return response;
}

deleteUser = (user) =>{
    //TO DO: Find user in database
    //TO DO: Change status of user in database
    let response = {
        statusCode: 200,
        body: "User succesfully deactivated"
    }
    return response;
}

validateUser = (user) =>{
    try{
        return (user.nombre!==null && user.telefono!==null 
    && user.direccion!==null && user.cedula!==null 
    && user.licenciatura!==null && user?.nombre.length > 0 
    && user?.telefono.length > 0 && user?.direccion.length > 0 
    && user?.cedula.length > 0 && user?.licenciatura.length > 0);
    }catch(error){
        return false;
    }
}

module.exports = {
    getUsers,
    getUser,
    saveUser,
    validateUser,
    updateUser,
    deleteUser
}