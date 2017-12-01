//server request functions using Jquery and Ajax requests
$.ajax({
    url: 'http://localhost:2000/api/move',
    type: 'post',
    data: {
        moveType: 'placeSoldier',
        x:8,
        y:9,
        xDir:1,
        yDir:0
    },
    headers: {
        'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImEiLCJ1c2VybmFtZSI6IjM2IiwidGVhbSI6IjAiLCJpYXQiOjE1MTEwNjI2MTQsImV4cCI6MTUyNTQ2MjYxNH0.WHB8yuCO-SEMdbpnO1xO18yhBN_HJk_Oj-FSFQuoOm0',
    },
    dataType: 'json',
    success: function (data) {
        console.info(data);
    }
});
