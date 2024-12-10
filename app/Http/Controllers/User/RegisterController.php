<?php

namespace App\Http\Controllers\User;

use Auth;
use Validator;
use App\Models\User;
use App\Models\SmsLog;
use App\Classes\DasMailer;
use Illuminate\Support\Str;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\Generalsetting;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Input;

class RegisterController extends Controller
{

	public function register(Request $request)
	{

		$gs = Generalsetting::findOrFail(1);

		if ($gs->is_capcha == 1) {
			$value = session('captcha_string');
			if ($request->codes != $value) {
				return response()->json(array('errors' => [0 => 'Please enter Correct Capcha Code.']));
			}
		}


		//--- Validation Section

		$rules = [
			// 'email'   => 'required|email|unique:users',
			// 'password' => 'required|confirmed',
			'password' => [
				'required',
				'min:6',
				'confirmed'
			],
			'phone' => 'required|unique:users',
			'city' => 'required',
			'state' => 'required'

		];
		$validator = Validator::make($request->all(), $rules);

		if ($validator->fails()) {
			return response()->json(array('errors' => $validator->getMessageBag()->toArray()));
		}
		//--- Validation Section Ends

		$user = new User;
		$input = $request->all();
		$input['password'] = bcrypt($request['password']);
		$token = md5(time() . $request->name . $request->email);
		$input['verification_link'] = $token;
		$input['affilate_code'] = md5($request->name . $request->email);

		if (!empty($request->vendor)) {

			//--- Validation Section
			$rules = [
				'shop_name' => 'unique:users',
				'shop_number'  => 'max:11'
			];
			$customs = [
				'shop_name.unique' => 'This Shop Name has already been taken.',
				'shop_number.max'  => 'Shop Number Must Be Less Then 10 Digit.'
			];

			$validator = Validator::make($request->all(), $rules, $customs);
			if ($validator->fails()) {
				return response()->json(array('errors' => $validator->getMessageBag()->toArray()));
			}
			$input['is_vendor'] = 1;
			$input['shop_name'] = str_replace('/', '', $input['shop_name']);
			$input['shop_name'] = str_replace('"', '', $input['shop_name']);
			$input['shop_name'] = str_replace("'", "", $input['shop_name']);
		}

		$user->fill($input)->save();
		if ($gs->is_verification_email == 1) {
			$to = $request->email;
			$subject = 'Verify your email address.';
			$msg = "Dear Customer,<br> We noticed that you need to verify your email address. <a href=" . url('user/register/verify/' . $token) . ">Simply click here to verify. </a>";
			//Sending Email To Customer
			// if($gs->is_smtp == 1)
			// {
			// $data = [
			//     'to' => $to,
			//     'subject' => $subject,
			//     'body' => $msg,
			// ];

			// $mailer = new DasMailer();
			// $mailer->sendCustomMail($data);
			// }
			// else
			// {
			// $headers = "From: ".$gs->from_name."<".$gs->from_email.">";
			// mail($to,$subject,$msg,$headers);
			// }


			return response()->json('We need to verify your email address. We have sent an email to ' . $to . ' to verify your email address. Please click link in that email to continue.');
		} else {

			$user->email_verified = 'Yes';
			$user->update();
			$notification = new Notification;
			$notification->user_id = $user->id;
			$notification->save();
			Auth::guard('web')->login($user);
			return response()->json(1);
		}
	}


	public function registerVendor(Request $request)
	{

		$gs = Generalsetting::findOrFail(1);

		if ($gs->is_capcha == 1) {
			$value = session('captcha_string');
			if ($request->codes != $value) {
				return response()->json(array('errors' => [0 => 'Please enter Correct Capcha Code.']));
			}
		}


		//--- Validation Section

		$rules = [
			// 'email'   => 'required|email|unique:users',
			// 'password' => 'required|confirmed',
			'password' => [
				'required',
				'min:6',
				'confirmed'
			],
			'phone' => 'required|unique:users',

		];
		$validator = Validator::make($request->all(), $rules);

		if ($validator->fails()) {
			return response()->json(array('errors' => $validator->getMessageBag()->toArray()));
		}
		//--- Validation Section Ends

		$user = new User;
		$input = $request->all();
		$input['password'] = bcrypt($request['password']);
		$token = md5(time() . $request->name . $request->email);
		$input['verification_link'] = $token;
		$input['affilate_code'] = md5($request->name . $request->email);

		if (!empty($request->vendor)) {

			//--- Validation Section
			$rules = [
				'shop_name' => 'unique:users',
				'shop_number'  => 'max:11'
			];
			$customs = [
				'shop_name.unique' => 'This Shop Name has already been taken.',
				'shop_number.max'  => 'Shop Number Must Be Less Then 10 Digit.'
			];

			$validator = Validator::make($request->all(), $rules, $customs);
			if ($validator->fails()) {
				return response()->json(array('errors' => $validator->getMessageBag()->toArray()));
			}
			$input['is_vendor'] = 1;
			$input['shop_name'] = str_replace('/', '', $input['shop_name']);
			$input['shop_name'] = str_replace('"', '', $input['shop_name']);
			$input['shop_name'] = str_replace("'", "", $input['shop_name']);
		}

		$user->fill($input)->save();
		if ($gs->is_verification_email == 1) {
			$to = $request->email;
			$subject = 'Verify your email address.';
			$msg = "Dear Customer,<br> We noticed that you need to verify your email address. <a href=" . url('user/register/verify/' . $token) . ">Simply click here to verify. </a>";
			//Sending Email To Customer
			// if($gs->is_smtp == 1)
			// {
			// $data = [
			//     'to' => $to,
			//     'subject' => $subject,
			//     'body' => $msg,
			// ];

			// $mailer = new DasMailer();
			// $mailer->sendCustomMail($data);
			// }
			// else
			// {
			// $headers = "From: ".$gs->from_name."<".$gs->from_email.">";
			// mail($to,$subject,$msg,$headers);
			// }


			return response()->json('We need to verify your email address. We have sent an email to ' . $to . ' to verify your email address. Please click link in that email to continue.');
		} else {

			$user->email_verified = 'Yes';
			$user->update();
			$notification = new Notification;
			$notification->user_id = $user->id;
			$notification->save();
			Auth::guard('web')->login($user);
			return response()->json(1);
		}
	}
	public function token($token)
	{
		$gs = Generalsetting::findOrFail(1);

		if ($gs->is_verification_email == 1) {
			$user = User::where('verification_link', '=', $token)->first();
			if (isset($user)) {
				$user->email_verified = 'Yes';
				$user->update();
				$notification = new Notification;
				$notification->user_id = $user->id;
				$notification->save();
				Auth::guard('web')->login($user);
				return redirect()->route('user-dashboard')->with('success', 'Email Verified Successfully');
			}
		} else {
			return redirect()->back();
		}
	}
	public function showRegisterForm()
	{
		//   $this->code_image();
		return view('user.register');
	}

	public function sendOtp(Request $request)
	{

		$otp = $this->gen_random_otp();
		$gs = Generalsetting::findOrFail(1);

		$msg = "Your 4 Digit OTP is : " . $otp . "\nPlease use this code to verify your number.\nThanks For Staying with BrightCommunication ";
		$number = "88" . $request->phone;


		$countSms = SmsLog::where('to', 'like', '%' . $number . '%')
			->whereRaw('DATE(created_at) = ?', [date('Y-m-d')])->get();


		$request->session()->put('otp', $otp);

		if ($countSms->count() > 8) {
			return response()->json(['data' => false, 'message' => 'sent', 'success' => 1], 200);
		} {

			if ($gs->is_sms == 1) {

				$response = Http::get('http://202.164.208.226/smsapi', [
					'api_key' => 'R200004765000487bfbf90.93933102',
					'type' => 'text',
					'contacts' => $number,
					'senderid' => '8809612440465',
					'msg' => $msg
				]);


				SmsLog::create(
					[
						'from' => 'Registration/Forget',
						'to' => $number,
						'message' => $msg,
						'status' => $response->body(),
						'sent_by' => "System"
					]
				);

				return response()->json(['data' => true, 'message' => 'sent', 'success' => 1], 200);
			} // end if sms
			return response()->json(['data' => false, 'message' => 'sent', 'success' => 1], 200);
		}
	}
	public function otpVerify(Request $request)
	{

		$otp = $request->otp;
		if ($otp == $request->session()->get('otp')) {
			$request->session()->forget('otp');
			return response()->json(['data' => true, 'message' => 'sent', 'success' => 1], 200);
		} else {
			return response()->json(['data' => false, 'message' => 'sent', 'success' => 1], 200);
		}
	}




	public function gen_random_otp()
	{

		// Available alpha caracters
		$characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

		// generate a pin based on 2 * 7 digits + a random character
		$pin = mt_rand(1111, 9999);

		/*$pin = mt_rand(100000, 999999)
	. $characters[rand(0, strlen($characters) - 1)]
	. $characters[rand(0, strlen($characters) - 1)];*/

		//$current_timestamp = Carbon::now()->timestamp;

		// shuffle the result
		$string = str_shuffle($pin);
		$num    = (int) $string;

		if ($num < 999) {
			$num += 1000;
		}

		return  $num;
	}


	// public function setCookie(Request $request){
	// 	$minutes = 60;
	// 	$response = new Response('Set Cookie');
	// 	$response->withCookie(cookie('name', 'MyValue', $minutes));
	// 	return $response;
	//  }

	//  public function getCookie(Request $request){
	// 	$value = $request->cookie('name');
	// 	echo $value;
	//  }


}
