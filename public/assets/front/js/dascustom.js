
$(document).ready(function () {



  if($(window).width()<600){

    $('.filter-result-area').hide();

}

  

  let $search_results = $('.search-form-das .search-result ul')
  let $search_box = $('.search-form-das input.search-box')
  //let $shop_id = $('.search-form-das input.shop_id')

  $('.search-icon').click(function (e) {
    e.preventDefault()
    $('.search-form-das').fadeToggle().find('input[type=text]').focus()
  })

  $('.search-form-das .close-btn').click(function () {
    $(this).closest('form').fadeOut()

    $search_box.val('')
    $search_results.empty()

  })

  let debounce = null

  $search_box.on('keyup', function () {

    let query = $(this).val();
    let shop  = $('#shop_id_search').val();

    clearTimeout(debounce)

    if (query === '' || shop=='') {

      $search_results.empty()

    } else {

      debounce = setTimeout(function () {

        $.ajax({
          url: mainurl + "/productSearch/",
          data: { 'q': query ,'shop_id':shop},
          success(res) {

            $search_results.empty()

           //console.log(res);
            var res = JSON.parse(res);
            //console.log(obj);


            if(res.length==0){

              $search_results.append('<li> No product found with this name in this shop</li>')

            

            }else{
             


              $.each(res, function (index, product) {

                
                var discount_percent = Math.round((((Number(product.previous_price)-Number(product.price))*100)/Number(product.previous_price))) ;
                var data ='<li>' +
                '<div class="card">' +
                '<div class="card-body"><div class="row"><div class="col-md-6">' +
                '<a href="' + mainurl + '/item/' + product.slug + '">' +
                '<img width=130 height=130 src="' + mainurl + '/assets/images/thumbnails/' + product.thumbnail + '" alt="No Image"></a></div>'+
                '<div class="col-md-6"><p class="title" >' + product.name + '</p>' +
                '<p class="price">Price: BDT ' + product.price + ' TK <del>'+ product.previous_price +'</del> TK</p>' ;


                // if( Number(discount_percent) > 0){
                //   data +=  '<p style="color:green;">'+ discount_percent+'% OFF</p>';
                 
                // }

                if( product.stock ==null || product.stock>0  ){
                
                  data +='<a  class="btn btn-sm btn-warning add-to-cart" data-href="'+mainurl+'/addcart/'+product.id+'" data-toggle="tooltip" data-placement="top" ><i class="icofont-cart"></i> Add To Cart</a></div>';
                }else{
                 
                  data +='<p style="color:red;">Stock Out</p>' +product.stock ;
                }

                
                
                data +='</div></div></div>' +
               
                '</li>';
                $search_results.append(data);

               






              })// end foreach 

            }
           
          } // end if success



        })
      }, 350)


    }

  })

})


