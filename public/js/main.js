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
            // If on the download count page and the user submits a rating for that paper, redisplay the dl count after paper is closed
            // $('.bottomItem' + i).find('span').show();
        }
        
        for(let j = 1; j < 15; j++){
            if(j != i && $('.item'+j).hasClass('selectedBox')){
                $('.item' + j).removeClass('selectedBox');
                $('.item' + j + ' .top .title h4').removeClass('selectedBoxHeaderText');
                $('.item' + j + ' p').removeClass('selectedBoxText');
                $('.item' + j + ' .top .expandButton button').attr('title', 'Click to expand');
                $('.item' + j + ' .top .expandButton button').html("");
                $('.item' + j + ' .top .expandButton button').append('<i class="fa fa-caret-down"></i>');
                $('.bottomItem' + j).find('.ratingText').remove();
                $('.bottomItem' + j).find('.rating').remove();
                $('.rating' + j).remove();
                $('.bottomItem' + j).find('span').show();
            }
        }

        $('.item' + i).toggleClass('selectedBox');
        $('.item' + i + ' .top .title h4').toggleClass('selectedBoxHeaderText');
        $('.item' + i + ' p').toggleClass('selectedBoxText');
        $('.item' + i + ' .top .expandButton button').attr('title', 'Click to collapse');
        
        // If the user clicked on a paper (the rating is not showing yet), show the rating stars thing and remove the download count
        if($('.rating' + i).length < 1){
            $('.bottomItem' + i).prepend('<div class="ratingText">Please rate before reading another abstract:</div><div class="rating">');
            $('.bottomItem' + i).find('.rating').append('<div class="rating' + i + '"></div><div class="ratingButton"><input class="btn btn-primary" type="submit" value="Submit"></div>');
            $('.rating' + i).addRating();

            // "Lock" the user in the current paper by not letting them collapse the current paper nor expand any other paper to see the abstract UNTIL
            // the user gives a rating and chooses to download or not.
            for(let j = 1; j < 15; j++){
                $('.item' + j + ' .top .expandButton').hide();
            }

            // Set up the onClick for the new button that was just created
            setUpRatingSubmission(i);

            // Remove the download count by hiding the element
            $('.bottomItem' + i).find('span').hide();

            // Make the rating system span 2 columns and center it
            $('.bottomItem' + i).css('text-align', 'center');
            $('.bottomItem' + i).css('grid-column', i + '/' + (i+2));

            // Hide the download count next to the clicked abstract because it interferes when making the abstract spand horizontally
            $('.bottomItem' + (i+1)).find('span').hide();

            // console.log($('.bottomItem' + i).find('.rating').html());
        }else{
            // Don't think this is ever called
            $('.bottomItem' + i).find('.ratingText').remove();
            $('.bottomItem' + i).find('.rating').remove();
            $('.rating' + i).remove();
        }
    });
}

$('#downloadModal .modal-footer .btn-primary').on('click', function(){
    var data = {
        'noDownloads': 1,
        'docID': $('#downloadModal').find('a').attr('data-docID')
    };
    // console.log(data);
    $.ajax({
        url: "",
        data: data,
        type: "GET",
        success: function(response){
            // console.log(response);
            $('#downloadModal').modal('hide');
            for(let j = 1; j < 15; j++){
                $('.item' + j + ' .top .expandButton').show();
            }

            // Find the #selectedBox and remove it
            var item = Number(String($('.selectedBox')[0].classList[1]).slice(-1));
            resetAbstracts(item);
        },
        error: console.error
    });
});

$('#downloadModal .modal-footer .btn-secondary').on('click', function(){
    $('#downloadModal').modal('hide');
    for(let j = 1; j < 15; j++){
        $('.item' + j + ' .top .expandButton').show();
    }

    // Find the #selectedBox and remove it
    // Switch dropdown caret
    // Remove star rating thing
    var item = Number(String($('.selectedBox')[0].classList[1]).slice(-1));
    resetAbstracts(item);
});

function setUpRatingSubmission(ratingNumber){
    // console.log('ratingNumber is: ' + ratingNumber);
    // console.log($('.rating' + ratingNumber).next().html());

    // The next sibling to, for example, rating1 is the button ratingButton. When clicked, grab the star rating given.
    $('.rating' + ratingNumber).next().on('click', function(){
        var starRating = countStars($('.rating' + ratingNumber));

        // First, we want to send back the doc id and rating to the DB (1)
        // Then, we want to open a modal that asks for download (2)
        // Next, if the user hits yes then download that pdf (have the yes button be the old a href) and send download thing to db 
        //       if the user hits no just close out the modal (3)
        // Lastly, remove the rating elements from the current paper, lose focus on the current paper, and re-enable the other dropdowns on the other papers. (4)

        // (1)
        var data = {
            'docID': Number($('.bottomItem' + ratingNumber).attr('data-docID')),
            'rating': starRating
        };
        // console.log(data);
        $.ajax({
            url: "",
            data: data,
            type: "GET",
            success: function(response){
                // console.log(response);
                // Add if to see if response was success!!!
                // (2)
                // Find the anchor tag for the modal yes button and add attribute href = "pdfs/name".
                $('#downloadModal').find('a').attr('data-docID', data.docID);
                $('#downloadModal').find('a').attr('href', 'pdfs/' + response.name);

                // Hide submit button after they click it so that they cant just keep submitting.
                $('.bottomItem' + ratingNumber).find('.rating').find('.ratingButton').hide();

                // Make it so that the modal is uncloseable.
                $('#downloadModal').modal({backdrop: 'static', keyboard: false});
                $('#downloadModal').modal('show');

                // (3) and (4) are handled by the on click functions above this one
            },
            error: console.error
        });
    });
}

// Get the star rating the user submitted
function countStars(element){
    return Number(element.find('#rating').attr('value'));
}

// Reset abstracts as in after getting passed the modal for downloading push the selected abstract back up so that all abstracts are hidden and it is just the titles again
function resetAbstracts(selectedBoxIndex){
    $('.selectedBox').find('.selectedBoxText').removeClass('selectedBoxText');
    $('.selectedBox').find('.selectedBoxHeaderText').removeClass('selectedBoxHeaderText');
    $('.selectedBox .top .expandButton button').html('');
    $('.selectedBox').css('opacity', '0.3');
    $('.selectedBox').removeClass('selectedBox');
    $('.bottomItem' + selectedBoxIndex).find('.ratingText').remove();
    $('.bottomItem' + selectedBoxIndex).find('.rating').remove();
    $('.rating' + selectedBoxIndex).remove();

    $('.bottomItem' + selectedBoxIndex).css('text-align', '');
    $('.bottomItem' + selectedBoxIndex).css('grid-column', '');
    $('.bottomItem' + selectedBoxIndex).css('grid-column', selectedBoxIndex);

    if($('.item' + (selectedBoxIndex+1)).css('opacity') == 1)  { 
        $('.bottomItem' + (selectedBoxIndex+1)).find('span').show();
    }
    // $('.bottomItem' + selectedBoxIndex).find('span').show();
}