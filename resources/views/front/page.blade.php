@extends('layouts.front')
@section('content')

<!-- Breadcrumb Area Start -->
<div class="breadcrumb-area">
  <div class="container">
    <div class="row">
      <div class="col-lg-12">
        <ul class="pages">
          <li>
            <a href="{{ route('front.index') }}">
              {{ $langg->lang17 }}
            </a>
          </li>
          <li>
            <a href="{{ route('front.page',$page->slug) }}">
              {{ $page->title }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
<!-- Breadcrumb Area End -->

<!-- {!! $page->details !!} -->


<!-- <section class="about" style="display: flex; align-items: center; justify-content: center;">
  <div class="container">
    <div class="row">
      <div class="col-lg-12">
        <div class="about-info" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
          <div style="margin-bottom: 20px;">
            <img src="https://raw.githubusercontent.com/pico-india/main-django/main/static/about-team.jpg" alt="" style="max-width: 100%; height: auto;">
          </div>
          <div>
            <h4 class="title">
              {{ $page->title }}
            </h4>
            <p style="font-size: larger;">
              Bright Communication is a Mobile Phone import & manufacturing oriented Company. Bright Communication started the journey in 2018 with its own Brand ICON mobile. Within a couple of years, we launched QMobile & tied up with KGTEL Mobile as a National Distributor in 2022. Presently, we are manufacturing products using SKD method. Now we are looking forward to CKD method. We believe that by providing quality mobile communication products and reliable services to the consumer’s end, more people can get connected with the rest of the world in an efficient way. We really think differently and do differently from others.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section> -->
<section style="display: flex; margin-top: 20px;">
  <div style="width: 50%;">
    <img src="{{asset('assets/images/about/about.gif')}}" alt="" style="width: 100%; height: 87%;">
  </div>
  <div style="width: 50%; padding: 20px;">
    <!-- <h4 class="title">
      {{ $page->title }}
    </h4> -->
    <span style=" font-size: 2.5rem; font-weight: bold;margin-left: 40%;">ABOUT <span class="our" style="color: #5CD2E6;">US</span></span>
    <p style="font-size: larger; font-weight: 600;margin-top: 20px;">
      Bright Communication is a Mobile Phone import & manufacturing oriented Company. Bright Communication started the journey in 2018 with its own Brand ICON mobile. Within a couple of years, we launched QMobile & tied up with KGTEL Mobile as a National Distributor in 2022. Presently, we are manufacturing products using SKD method. Now we are looking forward to CKD method. We believe that by providing quality mobile communication products and reliable services to the consumer’s end, more people can get connected with the rest of the world in an efficient way. We really think differently and do differently from others.
    </p>
  </div>
</section>


@endsection