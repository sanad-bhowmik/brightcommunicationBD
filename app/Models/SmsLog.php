<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    
    protected $table ='sms_logs';

    protected $fillable = ['from','to','message','status','sent_by'];
}
