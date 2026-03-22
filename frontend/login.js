async function login(email,password) {
    try{
    const response=await fetch("http://127.0.0.1:8000/login/",{method:"POST",  
         headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        useremail:email,
        userpassword:password
      })})
        const data=await response.json()
        console.log(data)
        if(data.message==="Login successful"){  
 
        localStorage.setItem("user_id", data.user_id)

          window.location.href = "/frontend/webpages/index.html"; 
        }else{
          alert("error: Invalid email or password")
        }

    }catch(error){
        console.error("there is a problem")
    }
    
}

function setupLoginForm() {
  const form = document.querySelector("form");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email0 = email.value.trim();
    const password0 = password.value.trim();

    login(email0, password0);
  });
}

function setupSignupForm() {
  const form = document.querySelector("form");
  const email = document.getElementById("newemail");
  const password = document.getElementById("newpassword");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email0 = email.value.trim();
    const password0 = password.value.trim();

    signup(email0, password0);
  });
}




async function signup(email, password) {
    try {
        const response = await fetch("http://127.0.0.1:8000/signup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                useremail: email,
                userpassword: password
            })
        });

        const data = await response.json();
        console.log(data);

        if (data.merror === "Email already exists") {
            alert("Email already exists");
        } else if (data.message === "Signup successful") {
            localStorage.setItem("user_id", data.user_id);
            window.location.href = "/frontend/webpages/index.html";
        }

    } catch (error) {
        console.error("There is a problem:", error);
    }
}


const from= document.querySelector("form")
const email=document.getElementById("email")
const password=document.getElementById("password")

const signup0=document.getElementById("sign-up")
const con=document.querySelector(".log-con")

signup0.addEventListener("click",()=>{
    con.innerHTML=`
     <h1>WELCOME TO EXPANSE TRAKER</h1>
      <h4>
         SIGN UP  WITH EMILL
      </h4>
      <form>
        <label>
          ENTER YOUR EMAIL AND NEW PASSWORD!
        </label>
        <input type="email" id="newemail" placeholder="✉email" required />
        <input
          type="password"
          id="newpassword"
          maxlength="72"
          placeholder="🔒password"
          required
        />
        <button type="submit" class="addacc">Get Signup</button>
      </form>

    
    
    
    `
    con.classList.toggle("signup");
    if(con.classList.contains("signup")){
      setupSignupForm();
        
      }
  
})


setupLoginForm();