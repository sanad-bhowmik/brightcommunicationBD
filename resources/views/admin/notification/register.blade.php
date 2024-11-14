@extends('layouts.front')

@section('content')
<section>
	<div class="tab-pane fade" id="nav-reg" >
		<div class="login-area signup-area">
			<div class="header-area">
				<h4 class="title">Sign Up</h4>
			</div>
			<div class="login-form signup-form">
				@include('includes.admin.form-login')
				<form class="mregisterform" action="{{route('user-register-submit')}}" method="POST">
					{{ csrf_field() }}

					<div class="form-input">
						<input type="text" class="User Name" name="name" placeholder="{{ $langg->lang182 }}" required="">
						<i class="icofont-user-alt-5"></i>
					</div>

					<div class="form-input">
						<input type="email" class="User Name" name="email" placeholder="{{ $langg->lang183 }}" required="">
						<i class="icofont-email"></i>
					</div>

					<div class="form-input">
						<input type="text" class="User Name" name="phone" placeholder="{{ $langg->lang184 }}" required="">
						<i class="icofont-phone"></i>
					</div>

					<div class="form-input">
						<input type="text" class="User Name" name="address" placeholder="{{ $langg->lang185 }}" required="">
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

				</form>
			</div>
		</div>
	</div>
</section>
@endsection