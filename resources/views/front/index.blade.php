@extends('layouts.front')

@section('content')

@if($ps->slider == 1)

    @if(count($sliders))

        @include('includes.slider-style')
    @endif
@endif

@if($ps->slider == 1)

    <style>
        @media (min-width: 1200px) {
            .intro-content.lazy {
                background-size: cover;
                background-position: center;
            }
        }
    </style>
    <!-- Hero Area Start -->
    <section class="hero-area">


        @if($ps->slider == 1)
            @if(count($sliders))
                <div class="hero-area-slider">
                    <div class="slide-progress"></div>
                    <div class="intro-carousel">
                        @foreach($sliders as $data)
                            <div class="intro-content {{$data->position}} lazy"
                                data-src="{{asset('assets/images/sliders/' . $data->photo)}}">
                                <div class="slider-content">
                                    <!-- layer 1 -->
                                    <div class="layer-1">
                                        <h4 style="font-size: {{$data->subtitle_size}}px; color: {{$data->subtitle_color}}"
                                            class="subtitle subtitle{{$data->id}}" data-animation="animated {{$data->subtitle_anime}}">
                                            {{$data->subtitle_text}}</h4>
                                        <h2 style="font-size: {{$data->title_size}}px; color: {{$data->title_color}}"
                                            class="title title{{$data->id}}" data-animation="animated {{$data->title_anime}}">
                                            {{$data->title_text}}</h2>
                                    </div>
                                    <!-- layer 2 -->
                                    <div class="layer-2">
                                        <p style="font-size: {{$data->details_size}}px; color: {{$data->details_color}}"
                                            class="text text{{$data->id}}" data-animation="animated {{$data->details_anime}}">
                                            {{$data->details_text}}</p>
                                    </div>
                                    <!-- layer 3 -->
                                    <div class="layer-3" style="display:none;">
                                        <a href="{{$data->link}}" target="_blank" class="mybtn1"><span>{{ $langg->lang25 }} <i
                                                    class="fas fa-chevron-right"></i></span></a>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        @endif


        </div>
    </section>
    <!-- Hero Area End -->
@endif


@if($ps->featured_category == 1)

    {{-- Slider Bottom Banner Start --}}
    <section class="slider_bottom_banner mt-10">

        <div class="row">
            <div class="col-lg-12">
                <div class="flash-deals">
                    <div class="series_slider">


                        @foreach(DB::table('featured_banners')->get()->chunk(4) as $data1)

                            @foreach($data1 as $data)

                                <a href="{{ $data->link }}" target="_blank" class="banner-effect">
                                    <img src="{{ $data->photo ? asset('assets/images/featuredbanner/' . $data->photo) : asset('assets/images/noimage.png') }}"
                                        alt="">
                                </a>

                            @endforeach


                        @endforeach

                    </div>
                </div>
            </div>
        </div>






    </section>
    {{-- Slider Botom Banner End --}}

@endif









@if($ps->service == 1)

    {{-- Info Area Start --}}
    <section class="info-area">
        <div class="container">

            @foreach($services->chunk(4) as $chunk)

                <div class="row">

                    <div class="col-lg-12 p-0">
                        <div class="info-big-box">
                            <div class="row">
                                @foreach($chunk as $service)
                                    <div class="col-6 col-xl-3 p-0">
                                        <div class="info-box">
                                            <div class="icon">
                                                <img src="{{ asset('assets/images/services/' . $service->photo) }}">
                                            </div>
                                            <div class="info">
                                                <div class="details">
                                                    <h4 class="title">{{ $service->title }}</h4>
                                                    <p class="text">
                                                        {!! $service->details !!}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>

                </div>

            @endforeach

        </div>
    </section>
    {{-- Info Area End --}}


@endif



@if($ps->featured == 1)
    <!-- Trending Item Area Start -->
    <section class="trending">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 remove-padding">
                    <div class="section-top">
                        <h2 class="section-title">
                            {{ $langg->lang26 }}
                        </h2>
                        {{-- <a href="#" class="link">View All</a> --}}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-12 remove-padding">
                    <div class="trending-item-slider">
                        @foreach($feature_products as $prod)
                            @include('includes.product.slider-product')
                        @endforeach
                    </div>
                </div>

            </div>
        </div>
    </section>
    <!-- Tranding Item Area End -->
@endif

@if($ps->small_banner == 1)
    <!-- Banner Area One Start -->
    <section class="banner-section">
        <div class="container">
            @foreach($brand_banners as $brand_id => $banners)
                <div class="row mb-5" style="margin-left: -15%; /* Applied only for big screens */width: 110%;">
                    <!-- Left Side: Brand Info -->
                    <div class="col-lg-3">
                        <div class="brand-info text-center">
                            <img src="{{ asset('assets/images/partner/' . $banners->first()->brand_photo) }}"
                                alt="{{ $banners->first()->brand_name }}" class="brand-img"
                                style="width: 70%; margin-top: 46%;">
                        </div>
                    </div>

                    <!-- Right Side: Brand-wise Banners -->
                    <div class="col-lg-9">
                        <div class="row" style="width: 130%; /* Applied only for big screens */">
                            @foreach($banners as $banner)
                                <div class="col-lg-4 col-md-6 mb-4">
                                    <div class="banner-box p-3">
                                        <a class="banner-effect" href="{{ $banner->link }}" target="_blank">
                                            <img src="https://brightcommunicationbd.com/assets/images/banners/{{ $banner->banner_photo }}"
                                                alt="">
                                        </a>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </section>

    <style>
        /* Styling for banners with border */
        .banner-box {
            border: 2px solid #ddd;
            /* Light gray border */
            border-radius: 8px;
            /* Optional: Rounded corners */
            transition: box-shadow 0.3s ease, border-color 0.3s ease;
            overflow: hidden;
            background-color: #fff;
            /* Add a background color for clarity */
        }

        /* Hover effect: Change border color and add shadow */
        .banner-box:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #007bff;
            /* Change border color on hover */
        }

        /* Banner image adjustments */
        .banner-box img {
            width: 100%;
            height: auto;
            object-fit: cover;
            max-height: 400px;
            /* Restrict max height */
            border-radius: 6px;
            /* Align with the banner-box radius */
        }

        /* Brand Image Styling */
        .brand-img {
            object-fit: contain;
        }

        /* Responsive Layout for Mobile Screens */
        @media (max-width: 768px) {
            .brand-img {
                width: 50%;
                /* Smaller size for brand images */
            }

            .banner-box img {
                width: 91%;
            }

            .brand-info {
                margin-top: -189px;
                margin-bottom: 29px;
                margin-left: 31px;
            }

            .col-lg-4 {
                width: 100%;
                /* Full-width banners for small screens */
            }

            .row {
                width: 100%;
                /* Remove extra width for mobile */
                margin-left: 0;
                /* Align correctly on mobile */
            }
        }
    </style>


    <!-- Banner Area One Start -->
@endif

<section id="extraData">
    <div class="text-center">
        <img class="{{ $gs->is_loader == 1 ? '' : 'd-none' }}" src="{{asset('assets/images/' . $gs->loader)}}">
    </div>
</section>


@endsection

@section('scripts')
<script type="text/javascript" src="{{asset('assets/front/js/lazy.min.js')}}"></script>
<script type="text/javascript" src="{{asset('assets/front/js/lazy.plugin.js')}}"></script>

<script>
    function lazy() {
        $(".lazy").Lazy({
            scrollDirection: 'vertical',
            effect: 'fadeIn',
            visibleOnly: true,
            onError: function (element) {
                console.log('error loading ' + element.data('src'));
            }
        });
    }

    $(window).on('load', function () {

        setTimeout(function () {
            $('#extraData').load('{{route("front.extraIndex")}}');

        }, 500);

        lazy();
    });


</script>
@endsection
