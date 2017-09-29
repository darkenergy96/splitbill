// $('#auth-form').on('submit',e=>{
//     e.preventDefault();
//     document.getElementById('info').innerHTML = '';
//     let email = $('#email').val();
//     let password = $('#password').val();
//     let credentials = {
//         email,
//         password
//     }
//     let data = JSON.stringify(credentials);
//     console.log(data)
//     $.ajax({
//         url:'/signup',
//         type:'POST',
//         beforeSend:xhr=>{
//             xhr.setRequestHeader('content-type','application/json');
//         },
//         data,
//         success:(res)=>{
//             if(res.success){
//                 location.href = "/"
//             }
//             else{
//                 document.getElementById('info').innerHTML = res.message;
//             }
//         }
//     })
// })