@extends('layouts.front')

@section('content')

<section class="login-signup">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-6">
        <nav class="comment-log-reg-tabmenu">
          <div class="nav nav-tabs" id="nav-tab" role="tablist">

            {{-- <a class="nav-item nav-link active" id="nav-reg-tab" data-toggle="tab" href="#nav-reg" role="tab" aria-controls="nav-reg" aria-selected="false">
              {{ $langg->lang198 }}
            </a> --}}


            {{-- <a class="nav-item nav-link login " id="nav-log-tab" data-toggle="tab" href="#nav-log" role="tab" aria-controls="nav-log" aria-selected="true">
              {{ $langg->lang197 }}
            </a> --}}
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" id="nav-reg" role="tabpanel" aria-labelledby="nav-reg-tab">
            <div class="login-area signup-area">
              <div class="header-area">
                <h4 class="title">{{ $langg->lang181 }}</h4>
              </div>
              <div class="login-form signup-form">
                @include('includes.admin.form-login')
                <form class="mregisterform" action="{{route('user-register-submit')}}" method="POST">
                  {{ csrf_field() }}

                  <div class="form-input">
                    <input id="phone" type="text" autocomplete="off" class="User Name" name="phone" placeholder="Please enter your number" required="">
                    <i class="icofont-phone">+88 &nbsp;</i>
                  </div>
                  <div id="otp-check" class="display-none">

                    <button id="btnCounter" class="otp-send"><span id="count">Send Otp</span></button>
                    <hr>
                    <div class="form-input">
                      <input id="otp" type="number" autocomplete="off" disabled class="User Name" placeholder="Please enter Otp" required="">
                      <i class="icofont-qr-code"></i>
                    </div>

                    <button id="btnVerify" class="otp-send display-none">Verify</button>
                  </div>


                  <div id="otp-confirm" class="display-none">
                    <div class="form-input">
                      <input type="text" class="User Name" name="name" placeholder="{{ $langg->lang182 }}" required="">
                      <i class="icofont-user-alt-5"></i>
                    </div>

                    <div class="form-input">
                      <input type="email" class="User Name" name="email" placeholder="{{ $langg->lang183 }}">
                      <i class="icofont-email"></i>
                    </div>



                    <div class="form-input">
                      <input type="text" class="User Name" name="address" placeholder="{{ $langg->lang185 }}" required="">
                      <i class="icofont-location-pin"></i>
                    </div>

                    <div class="form-input">
                      <input type="text" class="User Name" name="city" placeholder="District" required="">
                      <i class="icofont-location-pin"></i>
                    </div>
                    <div class="form-input">
                      <input type="text" class="User Name" name="state" placeholder="Thana" required="">
                      <i class="icofont-location-pin"></i>
                    </div>

                    <div class="form-input">
                      <input type="password" class="Password" name="password" placeholder="{{ $langg->lang186 }}" required="">
                      <i class="icofont-ui-password"></i>
                    </div>

                    <div class="form-input">
                      <input type="password" class="Password" name="password_confirmation" placeholder="{{ $langg->lang187 }}" required="">
                      <i class="icofont-ui-password"></i>
                    </div>

                    @if($gs->is_capcha == 1)

                    <ul class="captcha-area">
                      <li>
                        <p><img class="codeimg1" src="{{asset("assets/images/capcha_code.png")}}" alt=""> <i class="fas fa-sync-alt pointer refresh_code "></i></p>
                      </li>
                    </ul>

                    <div class="form-input">
                      <input type="text" class="Password" name="codes" placeholder="{{ $langg->lang51 }}" required="">
                      <i class="icofont-refresh"></i>
                    </div>

                    @endif

                    <input class="mprocessdata" type="hidden" value="{{ $langg->lang188 }}">
                    <button type="submit" class="submit-btn">{{ $langg->lang189 }}</button>

                  </div>



                </form>

                <p class="text-center">OR</p>

                <a class="btn submit-btn" href="{{ route('user.login')}}">
                  {{ $langg->lang197 }}
                </a>
              </div>
            </div>
          </div>

          <div class="tab-pane fade " id="nav-log" role="tabpanel" aria-labelledby="nav-log-tab">
            <div class="login-area">
              <div class="header-area">
                <h4 class="title">{{ $langg->lang172 }}</h4>
              </div>
              <div class="login-form signin-form">
                @include('includes.admin.form-login')
                <form class="mloginform" action="{{ route('user.login.submit') }}" method="POST">
                  {{ csrf_field() }}
                  <div class="form-input">
                    <input type="text" name="phone" placeholder="Enter Mobile Number" required="">
                    <i class="icofont-user-alt-5">&nbsp;+88 &nbsp;</i>
                  </div>
                  <div class="form-input">
                    <input type="password" class="Password" name="password" placeholder="{{ $langg->lang174 }}" required="">
                    <i class="icofont-ui-password"></i>
                  </div>
                  <div class="form-forgot-pass">
                    <div class="left">
                      <input type="checkbox" name="remember" id="mrp" {{ old('remember') ? 'checked' : '' }}>
                      <label for="mrp">{{ $langg->lang175 }}</label>
                    </div>
                    <div class="right">
                      <a href="{{ route('user-forgot') }}">
                        {{ $langg->lang176 }}
                      </a>
                    </div>
                  </div>
                  <input type="hidden" name="modal" value="1">
                  <input class="mauthdata" type="hidden" value="{{ $langg->lang177 }}">
                  <button type="submit" class="submit-btn">{{ $langg->lang178 }}</button>


                  <br>
                  <a class="btn submit-btn" href="{{ route('user-register')}}">
                    {{ $langg->lang198 }}
                  </a>
                  @if(App\Models\Socialsetting::find(1)->f_check == 1 || App\Models\Socialsetting::find(1)->g_check ==
                  1)
                  <!-- <div class="social-area">
                    <h3 class="title">{{ $langg->lang179 }}</h3>
                    <p class="text">{{ $langg->lang180 }}</p>
                    <ul class="social-links">
                      @if(App\Models\Socialsetting::find(1)->f_check == 1)
                      <li>
                        <a href="{{ route('social-provider','facebook') }}">
                          <i class="fab fa-facebook-f"></i>
                        </a>
                      </li>
                      @endif
                      @if(App\Models\Socialsetting::find(1)->g_check == 1)
                      <li>
                        <a href="{{ route('social-provider','google') }}">
                          <i class="fab fa-google-plus-g"></i>
                        </a>
                      </li>
                      @endif
                    </ul>
                  </div> -->
                  @endif
                </form>
              </div>
            </div>
          </div>


        </div>

      </div>

    </div>
  </div>
</section>

@endsection


@section('scripts')

<script>
  $(document).ready(function() {

    $('#phone').on('keyup', function() {

      var val = $(this).val();
      // console.log(val)

      if (val.length == 11) {

        $('#otp-check').removeClass('display-none');

        //console.log(val);

      } else {
        $('#otp-check').addClass('display-none');
      }




    });


    var spn = document.getElementById("count");
    var btn = document.getElementById("btnCounter");



    $("#btnCounter").on("click", function() {


      $("#phone").prop("readonly", true);
      $("#otp").prop("disabled", false);
      $('#btnVerify').removeClass("display-none");

      disableOtpBtn(180);


      toastr.options = {

        "positionClass": "toast-top-full-width",

      }





    }); //end btn counter

    $("#btnVerify").on("click", function() {

      //console.log("hello");
      verifyOtp();


    }); //end btn otp verify




    function disableOtpBtn(time) {

      btn.setAttribute("disabled", true);
      var count = time; // Set count
      var timer = null; // For referencing the timer
      btn.style.backgroundColor = "red";

      sendOtp();

      (function countDown() {
        // Display counter and start counting down
        spn.textContent = "Wait " + count + " sec before sending another otp!!";

        // Run the function again every second if the count is not zero
        if (count !== 0) {
          timer = setTimeout(countDown, 1000);
          count--; // decrease the timer
        } else {
          // Enable the button
          btn.removeAttribute("disabled");
          spn.textContent = "Resend Otp";
          btn.style.backgroundColor = "#047204";
        }
      }());







    } // end disable otp




    function sendOtp() {

      var number = $('#phone').val();

      //console.log(mainurl);

      $.ajax({
        type: 'GET',
        data: {
          phone: number
        },
        url: mainurl + '/user/otp',
        error: function(xhr, status, error) {

          var err = eval('(' + xhr.responseText + ')');
          alert(err.Message);

          // console.log(JSON.parse(xhr.responseText))
        },
        success: function(data) {

          var res = data.data;
          console.log(data);
          if (res == true) {
            toastr["success"]("Otp Sent !! Please Check Inbox !!")
          } else {
            toastr["warning"]("Too Many OTP Reqest for Today");
          }

        }
      });


    } //end send otp
    function verifyOtp() {

      var number = $('#otp').val();

      //console.log(mainurl);

      $.ajax({
        type: 'GET',
        data: {
          otp: number
        },
        url: mainurl + '/user/otpVerify',
        error: function(xhr, status, error) {

          var err = eval('(' + xhr.responseText + ')');
          alert(err.Message);

          // console.log(JSON.parse(xhr.responseText))
        },
        success: function(data) {
          var res = data.data;
          // console.log(res);
          if (res == true) {
            $('#otp-check').addClass('display-none');
            $('#otpVerify').addClass('display-none');
            $('#btnCounter').addClass('display-none');
            $('#otp-confirm').removeClass('display-none');
            toastr["success"]("OTP VERIFYED !!");
          } else {
            toastr["warning"]("OTP VERIFYED FAILED !!");
          }


        }
      });


    } //end send otp




  }); // end  of document ready
</script>

@endsection