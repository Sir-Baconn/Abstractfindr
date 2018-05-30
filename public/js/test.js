// $('button').click(function(){
//     $('embed').toggle();
// });
for (let i = 1; i < 15; i++) {
    var down = true;
    $('.item' + i + ' .top .expandButton button').click(function(){

        // Can't just use toggle fa-caret-down fa-caret-up because the i tag gets commented out for some reason...
        // So have to do this expensive includes call
        if($(this).html().includes('fa-caret-down')){
            $(this).html("");
            $(this).append('<i class="fa fa-caret-up"></i>');
        }else if($(this).html().includes('fa-caret-up')){
            $(this).html("");
            $(this).append('<i class="fa fa-caret-down"></i>');
        }

        for(let j = 1; j < 15; j++){
            if(j != i && $('.item'+j).hasClass('selectedBox')){
                $('.item'+j).removeClass('selectedBox');
                $('.item'+ j + ' .top .title h4').removeClass('selectedBoxHeaderText');
                $('.item'+ j + ' p').removeClass('selectedBoxText');
                $('.item' + j + ' .top .expandButton button').attr('title', 'Click to expand');
                $('.item' + j + ' .top .expandButton button').html("");
                $('.item' + j + ' .top .expandButton button').append('<i class="fa fa-caret-down"></i>');
                $('.bottomItem' + j).toggleClass('bottomItemSelected');
            }
            // else if($('.item'+j).hasClass('selectedBox')){
            //     console.log($(this).html());
            //     console.log('removing class');
            // }
        }

        $('.item' + i).toggleClass('selectedBox');
        $('.item' + i + ' .top .title h4').toggleClass('selectedBoxHeaderText');
        $('.item' + i + ' p').toggleClass('selectedBoxText');
        $('.item' + i + ' .top .expandButton button').attr('title', 'Click to collapse');
        $('.bottomItem' + i).toggleClass('bottomItemSelected');
    });
}

$('body').click(function(evt){
    if(evt.target.nodeName === "BUTTON")
          return;
          
    //For descendants of .item and svg
    if($(evt.target).closest('.item').length || $(evt.target).closest('svg').length)
       return;             

    for(let i = 1; i < 15; i++){
        if($('.item'+i).hasClass('selectedBox')){
            $('.item'+i).removeClass('selectedBox');
            $('.item'+ i + ' .top .title h4').removeClass('selectedBoxHeaderText');
            $('.item'+ i + ' p').removeClass('selectedBoxText');
            $('.item' + i + ' .top .expandButton button').attr('title', 'Click to expand');
            $('.item' + i + ' .top .expandButton button').html("");
            $('.item' + i + ' .top .expandButton button').append('<i class="fa fa-caret-down"></i>');
            $('.bottomItem' + i).toggleClass('bottomItemSelected');            
        }
    }
});

$('.downloadButton').on('click', function(){
    var data;
    if(typeof $(this).parent().parent().find('span')[0] != 'undefined'){
        data = {
            'currDownloads': Number($.trim($(this).parent().parent().find('span')[0].innerText).split(': ')[1]),
            'docID': Number($($(this).parent().parent().find('a')[0]).attr('data-docID'))
        };
        // console.log(data);
        $.ajax({
            url: "",
            data: data,
            type: "GET",
            success: function(response){
                // console.log(response);
            },
            error: console.error
        });
    }else{
        data = {
            'noDownloads': 1,
            'docID': Number($($(this).parent().parent().find('a')[0]).attr('data-docID'))
        };
        // console.log(data);
        $.ajax({
            url: "",
            data: data,
            type: "GET",
            success: function(response){
                // console.log(response);
            },
            error: console.error
        });
    }
});