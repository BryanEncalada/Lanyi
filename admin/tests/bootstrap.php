<?php

use Brick\Math\Internal\Calculator\NativeCalculator;
use Brick\Math\Internal\CalculatorRegistry;

require __DIR__.'/../vendor/autoload.php';
// PHP Windows incluye BCMath: esta opción ejercita el fallback real de brick/math.
if (getenv('TEST_WITHOUT_BCMATH') === '1') {
    CalculatorRegistry::set(new NativeCalculator);
}
