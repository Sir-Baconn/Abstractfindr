if($('.entireThing').hasClass('pgs')){
    $('#pagination').twbsPagination({
        totalPages: 4,
        visiblePages: 4,
        onPageClick: function (event, page) {
            for(let i = 1; i < 4; i++){
                $('#set-' + (page-i)).addClass('setHidden');
                $('#set-' + (page+i)).addClass('setHidden');
            }

            if($('#set-' + page).hasClass('setHidden')){
                $('#set-' + page).removeClass('setHidden');
            }

            // If title is going to go onto second line, make the height 30 instead of 15 in order to center it
            // iheight is the starting index of the page, i.e. page one starts at 0
            // limit is the ending index of the page, i.e. page one ends at 12
            var iHeight = 0;
            var limit = 12;
            if(page == 2){
                iHeight = 12;
                limit = 24;
            }else if(page == 3){
                iHeight = 24;
                limit = 36;
            }else if(page == 4){
                iHeight = 36;
                limit = 49;
            }

            // If the h6 height is bigger than 30 then text is on a second line and needs to have a bigger height to center
            for(; iHeight < limit; iHeight++){
                if($('.item' + (iHeight+1) + ' h6').height() > 30 && $('.item' + (iHeight+1) + ' h6').height() < 40){
                    $('.item' + (iHeight+1) + ' .top').css('height', '30px');
                }else if($('.item' + (iHeight+1) + ' h6').height() > 40){
                    $('.item' + (iHeight+1) + ' .top').css('height', '45px');
                }
                // else if($('.item' + iHeight + ' h6').width() < 500 && $('.item' + iHeight + ' h6').height() > 30)
            }
        }
    });
}

for (let i = 1; i < 49; i++) {

    if(!$('.entireThing').hasClass('pgs')){
        if($('.item' + i + ' h6').height() > 30){
            $('.item' + i + ' .top').css('height', '30px');
        }
    }

    $('.item' + i).on('click', function(){

        setUpRatingSubmissionV2(i);

        $('.item' + i).toggleClass('selectedBox');
    });
}

$('#testModal .modal-footer .btn-primary').on('click', function(){
    var data = {
        'noDownloads': 1,
        'docID': $('#testModal').find('a').attr('data-docID')
    };
    
    $.ajax({
        url: "",
        data: data,
        type: "GET",
        success: function(response){
            // console.log(response);
            $('#testModal').modal('hide');
            for(let j = 1; j < 49; j++){
                $('.item' + j + ' .top .expandButton').show();
            }

            // Find the #selectedBox and remove it
            var itemClass = $('.selectedBox')[0].classList[1];
            var item = Number(itemClass.substring(4, itemClass.length));
            resetAbstracts(item);
        },
        error: console.error
    });
});

$('#testModal .modal-footer .btn-secondary').on('click', function(){
    $('#testModal').modal('hide');
    for(let j = 1; j < 49; j++){
        $('.item' + j + ' .top .expandButton').show();
    }

    // Find the #selectedBox and remove it
    // Switch dropdown caret
    // Remove star rating thing
    var itemClass = $('.selectedBox')[0].classList[1];
    var item = Number(itemClass.substring(4, itemClass.length));
    resetAbstracts(item);
});

function setUpRatingSubmissionV2(ratingNumber){
    var title = $('.item' + ratingNumber).find('.title h6').text();
    var abstract = $('.item' + ratingNumber + ' p').text();

    $('#testModal').find('.modal-title').text(title);
    $('#testModal').find('.modal-body').text(abstract);
    // $('#testModal').find('.modal-body').append('<span>Downloads: 50</span>');

    $('#testModal').find('.modal-footer #footerLeft').append('<p class="ratingText">How would you rate this abstract?</p><div class="rating">');
    $('#testModal').find('.modal-footer #footerLeft').append('<div class="rating' + ratingNumber + '"></div>');
    $('#testModal').find('.rating').addRating();

    var ratingStars = $('#testModal').find('.rating').children();
    
    for (let i = 0; i < ratingStars.length - 1; i++) {
        // add onclick for each star
        // the star rating is equal to i + 1, i.e. if they hit the first star i = 0 and star rating is 1
        $(ratingStars[i]).on('click', function(){
            
            var data = {
                'docID': Number($('.bottomItem' + ratingNumber).attr('data-docID')),
                'rating': i+1
            };
            
            $.ajax({
                url: "",
                data: data,
                type: "GET",
                success: function(response){
                    // console.log(response);
                    $('#testModal').find('.modal-footer #footerRight a').removeAttr('disabled');
                    $('#testModal').find('.modal-footer #footerRight a button').removeAttr('disabled');
                    $('#testModal').find('.modal-footer #footerRight .btn-secondary').removeAttr('disabled');
                    $('#testModal').find('.modal-footer #footerRight a').attr('data-docID', data.docID);
                    $('#testModal').find('.modal-footer #footerRight a').attr('href', 'pdfs/' + response.name);
                },
                error: console.error
            });

            // turn off every onclick for ratings so that they can't spam rate
            for(let j = 0; j < ratingStars.length - 1; j++){
                $(ratingStars[j]).off('click');
            }

        });
    }

    $('#testModal').modal({backdrop: 'static', keyboard: false});
    $('#testModal').modal('show');
}

// Reset abstracts as in after getting passed the modal for downloading push the selected abstract back up so that all abstracts are hidden and it is just the titles again
function resetAbstracts(selectedBoxIndex){
    // console.log('box index: ' + selectedBoxIndex);
    $('.selectedBox').css('opacity', '0.3');
    $('.selectedBox').css('cursor', 'default');
    $('.selectedBox').removeClass('selectedBox');
    $('.bottomItem' + selectedBoxIndex).find('.ratingText').remove();
    $('.bottomItem' + selectedBoxIndex).find('.rating').remove();
    $('.rating' + selectedBoxIndex).remove();

    // Remove the rating system on the modal otherwise it will stack on each paper clicked - could probablyjust toggle hide on/off instead of adding/removing
    $('#testModal').find('.modal-footer #footerLeft').find('.ratingText').remove();
    $('#testModal').find('.modal-footer #footerLeft').find('.rating').remove();

    // Make the download buttons disabled again for the next paper
    $('#testModal').find('.modal-footer #footerRight a').attr('disabled', '');
    $('#testModal').find('.modal-footer #footerRight a button').attr('disabled', '');
    $('#testModal').find('.modal-footer #footerRight .btn-secondary').attr('disabled', '');

    // Remove the onclick handler - don't let the paper to be clicked after it has been viewed once
    $('.item' + selectedBoxIndex).off('click');
}

// On refresh if there are viewed papers they need to have their onclicks turned off
for (let i = 1; i < 49; i++) {
    if($('.item' + i).hasClass('viewedPaper')){
        $('.item' + i).off('click');
    }
}