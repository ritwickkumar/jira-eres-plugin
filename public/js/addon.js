/* add-on script */
$(document).ready(function(){
    $("#approve").click(function(){
        $.post("/api/v1/approval/",
            {
                id: $("#username").val(),
                password: $("#password").val()
            },
            function(data, status){
            alert(data);
            });
        // AP.require(['dialog'], function(dialog){
        //     dialog.close();
        // });
    });
});

$(document).ready(function(){
    $("#reject").click(function(){
        alert("Reject Button clicked");
        AP.require(['dialog'], function(dialog){
            dialog.close();
        });
    });

});