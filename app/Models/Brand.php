<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    //
    protected $fillable = ['brand_name','brand_code','photo','status'];




    public function brandName(){
       
        return $this->brand_name;
    }
}
