<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\Resource;

class OrderResource extends Resource
{
  /**
   * Transform the resource into an array.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return array
   */
  public function toArray($request)
  {



    $cart = unserialize(bzdecompress(utf8_decode($this->cart)));

    foreach ($cart->items as $item) {
      $new_cart[] = $item;
    }
    $i = 0;
    foreach ($new_cart as $value) {

      if (isset($new_cart[$i]['item'])) {
        $newdata["id"] = $new_cart[$i]['item']['id'];
        $newdata['name'] = $new_cart[$i]['item']['name'];
        $newdata['vendor_id'] = $new_cart[$i]['item']['user_id'];
        $newdata['type'] = $new_cart[$i]['item']['type'];
        $newdata['feature_image'] = url('/') . '/assets/images/products/' . $new_cart[$i]['item']['photo'];

        $new_cart[$i] += $newdata;
        unset($new_cart[$i]['item']);


        $new_cart[$i] += ['total_price' => $new_cart[$i]['price']];

        unset($new_cart[$i]['license']);
        unset($new_cart[$i]['dp']);
        unset($new_cart[$i]['price']);
      }

      $i++;
    }

    if ($this->payment_status != 'Completed') {
      if ($this->method != 'Cash On Delivery' && $this->method != 'Mobile Money') {

        return [
          'id' => $this->id,
          'number' => $this->order_number,
          'total' => $this->currency_sign . "" . round($this->pay_amount * $this->currency_value, 2),
          'status' => $this->status,
          'details' => route('order', $this->id),
          'products' => $new_cart,
          'created_at' => date('Y-m-d H:i', strtotime($this->created_at)),
          'updated_at' => date('Y-m-d H:i', strtotime($this->updated_at)),
          'payment_url' => route('payment.checkout') . "?order_number=" . $this->order_number
        ];
      } else {
        return [
          'id' => $this->id,
          'number' => $this->order_number,
          'total' => $this->currency_sign . "" . round($this->pay_amount * $this->currency_value, 2),
          'status' => $this->status,
          'details' => route('order', $this->id),
          'products' => $new_cart,
          'created_at' => date('Y-m-d H:i', strtotime($this->created_at)),
          'updated_at' => date('Y-m-d H:i', strtotime($this->updated_at)),

        ];
      }
    } else {
      return [
        'id' => $this->id,
        'number' => $this->order_number,
        'total' => $this->currency_sign . "" . round($this->pay_amount * $this->currency_value, 2),
        'status' => $this->status,
        'details' => route('order', $this->id),
        'products' => $new_cart,
        'created_at' => date('Y-m-d H:i', strtotime($this->created_at)),
        'updated_at' => date('Y-m-d H:i', strtotime($this->updated_at)),

      ];
    }
  }
}
