

async function get(){
    try {
        const response=await fetch("http://127.0.0.1:8000/")
        const data= await response.json()
        const head=document.querySelector("h1")
        head.textContent=data.message
        console.log("working",data)
        
    } catch (error) {
        console.log("there is a problem",error)
        
    }
}

get();