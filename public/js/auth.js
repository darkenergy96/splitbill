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
// forgot-password page
$('#forgot-pass').on('submit',function(e){
    e.preventDefault();
    let email = $('#email').val();
    $.ajax({
        url:'/forgot-password',
        type:'POST',
    //    beforeSend:xhr=>{
    //         xhr.setRequestHeader('content-type','application/json');
    //     }, 
        data:{email:email},
        success:(res)=>{
            if(res.success){
                document.getElementById('info').innerHTML = res.message
                $('#forgot-pass').hide();
            }
            else{
                document.getElementById('warn').innerHTML = res.message;
            }
        }
    })
        })
// reset-password
$('#reset-pass').on('submit',function(e){
    e.preventDefault();
    let password = $('#password').val();
    $.ajax({
        url:window.location.pathname,
        type:'POST',
    //    beforeSend:xhr=>{
    //         xhr.setRequestHeader('content-type','application/json');
    //     }, 
        data:{password:password},
        success:(res)=>{
            if(res.success){
                document.getElementById('reset-info').innerHTML = res.message
                $('#forgot-pass').hide();
            }
            else{
                document.getElementById('reset-warn').innerHTML = res.message;
            }
        }
    })
        }) 
