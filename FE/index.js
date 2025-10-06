

const clientIo = io("http://localhost:3000/",{
    auth: {authorization:"BearerTocken"}
})


clientIo.on("connect", ()=> {
  console.log(`Server stablish connection successfully`);
  
})


clientIo.on("connect_error", (error)=> {
  console.log(`connection error ::: ${error.message}`);
  
})

clientIo.emit("sayHi",
    "Hallo from Fe to Be",
    (res)=>{
        console.log({res});
        
    }
)

clientIo.on(
    "productStock",
    (data)=>{
        console.log({
            product: data
        });
        
    }
)

