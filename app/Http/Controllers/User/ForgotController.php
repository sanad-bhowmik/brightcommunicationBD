<?php

namespace App\Http\Controllers\User;

use Validator;
use App\Models\User;
use App\Models\SmsLog;
use App\Classes\DasMailer;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Generalsetting;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Input;

class ForgotController extends Controller
{
  public function __construct()
  {
    $this->middleware('guest');
  }

  public function showForgotForm()
  {
    return view('user.forgot');
  }

  public function forgot(Request $request)
  {
    $gs = Generalsetting::findOrFail(1);
    $input =  $request->all();
    if (User::where('phone', '=', $request->phone)->count() > 0) {
      // user found
      $admin = User::where('phone', '=', $request->phone)->firstOrFail();
      $autopass =  "bright" . mt_rand(111, 999);     //Str::random(6);
      $input['password'] = bcrypt($autopass);

      $msg = "Dear Customer,\n Your New Password is: " . $autopass . "\nUse this password to login into your account.\n Thanks www.brightcommunication.com";
      // if($gs->is_smtp == 1)
      // {
      //     $data = [
      //             'to' => $request->email,
      //             'subject' => $subject,
      //             'body' => $msg,
      //     ];

      //     $mailer = new DasMailer();
      //     $mailer->sendCustomMail($data);                
      // }
      // else
      // {
      //     $headers = "From: ".$gs->from_name."<".$gs->from_email.">";
      //     mail($request->email,$subject,$msg,$headers);            
      // }

      if ($gs->is_sms == 1) {

        $admin->update($input);
        $number = "88" . $request->phone;
        $response = Http::get('http://202.164.208.226/smsapi', [
          'api_key' => 'R200004765000487bfbf90.93933102',
          'type' => 'text',
          'contacts' => $number,
          'senderid' => '8809612440465',
          'msg' => $msg
        ]);




        SmsLog::create(
          [
            'from' => 'Password Reset',
            'to' => $number,
            'message' => $msg,
            'status' => $response->body(),
            'sent_by' => "System"
          ]
        );
        return response()->json('Your Password Reseted Successfully. Please Check your inbox for new Password.');
      } else {
        return response()->json('Request can not be process now, try later !!');
      }
    } else {
      // user not found
      return response()->json(array('errors' => [0 => 'No User Found With This Number.']));
    }
  }
}
