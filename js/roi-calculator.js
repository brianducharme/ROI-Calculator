//<![CDATA[ 
var ROICalculator = {
	// Set Defaults Here
	settings :  {
		bDiscountRate: 2.90, // Business Discount Rate [%]
		bDiscountSavings: 16, // Business Discount Savings [%]
		bTransactionFee: .03, // Business Transaction Fee [$]
		cCardPresentRate: 1.80, // Consumer Card Present Discount Rate [%]
		cNotPresentRate: 2.30, // Consumer Card Not Present Discount Rate [%]
		cDiscountSavings: 8, // Consumer Discount Savings [%]
		cNPDiscountSavings: 12, // Consumer Discount Savings (Card Not Present) [%]
		cTransactionFee: .03, // Consumer Transaction Fee [$]
		baseURL: 'http://www.whiteravenconsulting.com/roi/roi-calculator.html'  // Used for Send to Friend
	},
	// User Inputs
	iCustomerType: 'Consumer', // Business | Consumer
	iQBHoursSpent: 0, // QuickBooks Hours Spent per Month [#]
	iQBEmployeeHourly: 0, // Employee Hourly Wage [$]
	iCPTransactions: 0, // Percentage of Transactions Processed Card Present [%]
	iMonthlySales: 0, // Average Monthly Sales [$]
	iAverageTicket: 0, // Average Ticket [$] *calculated*
	iMonthlyTransactions: 0, // Monthly Transactions [#] *calculated*
	// Hidden Fields
	hTransactionCost1: 0,
	hTransactionCost2: 0,
	hRateDiscount1: 0,
	hRateDiscount2: 0,
	hTransactionDiscount: 0,
	// Calculated Outputs
	oQBMonthlySavings: 0,
	oQBAnnualSavings: 0,
	oMSPMonthlySavings: 0,
	oMSPAnnualSavings: 0,
	oTotalMonthlySavings: 0,
	oTotalAnnualSavings: 0,
}
function addCommas(nStr) { // Format Numbers by adding commas
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
function getURLParams() {
  var searchString = window.location.search.substring(1),
      params = searchString.split("&"),
      hash = {};

  if (searchString == "") return {};
  for (var i = 0; i < params.length; i++) {
    var val = params[i].split("=");
    hash[unescape(val[0])] = unescape(val[1]);
  }
  return hash;
}
function preFillForm() {
	$('.form-horizontal').show(); // Sets CPTransactions to Hidden by default
	var f = getURLParams();
	if(f.length != 'undefined') {
		$.each(f, function(key,value) {
			if(key == 'iCustomerType') {
				if(value == 'Business') {
					$('#roi-calculator #iCustomerType2').prop('checked',true);
					$('.form-horizontal').hide();
				}
				else {
					$('#roi-calculator #iCustomerType1').prop('checked',true);
					$('.form-horizontal').show();
				}
			}
			else{
				$('#roi-calculator #' + key ).val(value);
			}
		});
		requiredFields();
	}	
}
function resetForm() {
	$('#roi-calculator #iCustomerType1').prop('checked',true);
	$('.form-horizontal').show();
	$('#roi-calculator #iQBHoursSpent').val('');
	$('#roi-calculator #iQBEmployeeHourly').val('');
	$('#roi-calculator #iCPTransactions').val('');
	$('#roi-calculator #iMonthlySales').val('');
	$('#roi-calculator #iAverageTicket').val('');
	$('#roi-calculator #iMonthlyTransactions').val('');
	updateValues();
	$('#roi-calculator #SendToFriend').hide();
	calculateROI();
}
function requiredFields() {
	var r = ROICalculator;
	// Get current values & update globals
	updateValues();
	// validation

	calculateROI();
}
function updateValues() {
	var r = ROICalculator;
	// Get current values & update globals
	r.iCustomerType = $('input:radio[name=iCustomerType]:checked').val();
	r.iQBHoursSpent = $('#roi-calculator #iQBHoursSpent').val();
	r.iQBEmployeeHourly = $('#roi-calculator #iQBEmployeeHourly').val();
	r.iCPTransactions = $('#roi-calculator #iCPTransactions').val();
	r.iMonthlySales = $('#roi-calculator #iMonthlySales').val();
	r.iAverageTicket = $('#roi-calculator #iAverageTicket').val();
	r.iMonthlyTransactions = $('#roi-calculator #iMonthlyTransactions').val();
	// Create Send To Friend URL
	r.preFillURL = '?iCustomerType=' + r.iCustomerType + '&iQBHoursSpent=' + r.iQBHoursSpent + '&iQBEmployeeHourly=' + r.iQBEmployeeHourly;
	r.preFillURL += '&iMonthlySales=' + r.iMonthlySales + '&iAverageTicket=' + r.iAverageTicket + '&iMonthlyTransactions=' + r.iMonthlyTransactions;
	if(r.iCustomerType == 'Business') {
		r.preFillURL += '&iCPTransactions=' + r.iCPTransactions;
	}
}
function calculateROI() {
	var r = ROICalculator;
	if(r.iCustomerType == 'Business') {
		r.settings.bDiscountSavings;
		r.hTransactionCost1 = +(r.iMonthlySales * (r.settings.bDiscountRate/100)).toFixed(2);
		r.hTransactionCost2 = 0;
		r.hRateDiscount1 = +(r.hTransactionCost1 * (r.settings.bDiscountSavings/100)).toFixed(2);
		r.hRateDiscount2 = 0;
		r.hTransactionDiscount = Math.round(r.iMonthlyTransactions * r.settings.bTransactionFee);
	}
	else {
		var sub1 = +(r.iMonthlySales * (r.iCPTransactions/100)).toFixed(2); // get monthly sales with Card Present
		var sub2 = +(r.iMonthlySales * (1-(r.iCPTransactions/100))).toFixed(2); // get monthly sales with Card Not Present
		r.hTransactionCost1 = +(sub1 * (r.settings.cCardPresentRate/100)).toFixed(2);
		r.hTransactionCost2 = +(sub2 * (r.settings.cNotPresentRate/100)).toFixed(2);
		r.hRateDiscount1 = +(r.hTransactionCost1 * (r.settings.cDiscountSavings/100)).toFixed(2);
		r.hRateDiscount2 = +(r.hTransactionCost2 * (r.settings.cNPDiscountSavings/100)).toFixed(2);
		r.hTransactionDiscount = +(r.iMonthlyTransactions * r.settings.cTransactionFee).toFixed(2);
	}
	// Calculate QB Monthly and Annual Savings
	r.oQBMonthlySavings = r.iQBHoursSpent * r.iQBEmployeeHourly;
	r.oQBAnnualSavings = r.oQBMonthlySavings * 12;
	// Calculate MSP Monthly and Annual Savings
	r.oMSPMonthlySavings = +(r.hRateDiscount1 + r.hRateDiscount2 + r.hTransactionDiscount).toFixed(2);
	r.oMSPAnnualSavings = +(r.oMSPMonthlySavings * 12).toFixed(2);
	// Calculate Total Monthly and Annual Savings
	r.oTotalMonthlySavings = r.oQBMonthlySavings + r.oMSPMonthlySavings;
	r.oTotalAnnualSavings = +(r.oTotalMonthlySavings * 12).toFixed(2);
	// Output to Screen
	$('#roi-calculator #oQBMonthlySavings').text('$ ' + addCommas((r.oQBMonthlySavings).toFixed(2)));
	$('#roi-calculator #oQBAnnualSavings').text('$ ' + addCommas((r.oQBAnnualSavings).toFixed(2)));
	$('#roi-calculator #oMSPMonthlySavings').text('$ ' + addCommas((r.oMSPMonthlySavings).toFixed(2)));
	$('#roi-calculator #oMSPAnnualSavings').text('$ ' + addCommas((r.oMSPAnnualSavings).toFixed(2)));
	$('#roi-calculator #oTotalMonthlySavings').text('$ ' + addCommas((r.oTotalMonthlySavings).toFixed(2)));
	$('#roi-calculator #oTotalAnnualSavings').text('$ ' + addCommas((r.oTotalAnnualSavings).toFixed(2)));
	console.log(r);
	//$('#roi-calculator #SendToFriend').prop('href')
	if(r.oTotalAnnualSavings) {
		sendToFriend();
	}
}
function sendToFriend() {
	$('#roi-calculator #SendToFriend').show();
	var msg = 'mailto:?subject=Look at these Savings&body=I found a way for us to save $' + addCommas(ROICalculator.oTotalAnnualSavings.toFixed(2)) + ' annually using Avalon Payment Solutions.%0A%0ATake a look at this: %0A%0A '+ ROICalculator.settings.baseURL + ROICalculator.preFillURL.replace(/&/g,'%26') + '%0A%0A';
	$('#roi-calculator #SendToFriend a').prop('href',msg);
}
function calculateTransactions(mode) { // sales | transactions | ticket
	var s = $('#iMonthlySales').val();
	var t = $('#iMonthlyTransactions').val();
	var a = $('#iAverageTicket').val();
	switch(mode) {
		case 'sales' : 
			if(a) {
				ROICalculator.iMonthlyTransactions = Math.round(s / a);
				$('#roi-calculator #iMonthlyTransactions').val(ROICalculator.iMonthlyTransactions)
			}
			break;
		case 'transactions' :
			if(s) {
				ROICalculator.iAverageTicket = +(s / t).toFixed(2);
				$('#roi-calculator #iAverageTicket').val(ROICalculator.iAverageTicket)
			}
			break;
		case 'ticket' :
			if(s) {
				ROICalculator.iMonthlyTransactions = Math.round(s / a);
				$('#roi-calculator #iMonthlyTransactions').val(ROICalculator.iMonthlyTransactions)
			}
			break;
		default :
			break;
	}
	updateValues();
}
function reOrderTotal() {
	var w = $(window).width();
	if(w < 750) {
		$('#totals').each(function() {
	        $(this).appendTo(this.parentNode);
	    });
	} 
	else {
		$('#step2').each(function() {
	        $(this).appendTo(this.parentNode);
	    });
	}
}

$( document ).ready(function() {
	$('#roi-calculator #SendToFriend').hide();
	preFillForm();
	reOrderTotal();
	// Event Bindings
	$('#roi-calculator input:radio[name=iCustomerType]').bind('click', function(e){
		ROICalculator.iCustomerType = $('input:radio[name=iCustomerType]:checked').val();
		if(ROICalculator.iCustomerType == 'Business') {
			$('.form-horizontal').hide();
		} else {
			$('.form-horizontal').show();
		}
	});
	$('#roi-calculator #resetForm').bind('click', function(e){
		e.preventDefault();
		resetForm();
	})
	$('#roi-calculator #iMonthlySales').bind('change', function(e){
		calculateTransactions('sales');
	})
	$('#roi-calculator #iMonthlyTransactions').bind('change', function(e){
		calculateTransactions('transactions');
	});
	$('#roi-calculator #iAverageTicket').bind('change', function(e){
		calculateTransactions('ticket');
	})
	$('#roi-calculator #iCalculate').bind('click', function(e){
		e.preventDefault();
		//$('#roi-form').data('bootstrapValidator').validate();
		requiredFields();
	});
	$(window).resize(function(e){
		reOrderTotal();
	})
	// $('#roi-form').bootstrapValidator({
 //        message: 'This value is not valid',
 //        submitButtons: 'button[type="submit"]',
 //        live: 'enabled',
 //        submitHandler: requiredFields(),
 //        feedbackIcons: {
 //            valid: 'glyphicon glyphicon-ok',
 //            invalid: 'glyphicon glyphicon-remove',
 //            validating: 'glyphicon glyphicon-refresh'
 //        },
 //        fields: {
 //            iQBHoursSpent: {
 //                message: 'The username is not valid',
 //                validators: {
 //                    notEmpty: {
 //                        message: 'This field is required and cannot be empty'
 //                    },
 //                    numeric: {
 //                        message: 'Must be a number'
 //                    }
 //                }
 //            },
 //            iQBEmployeeHourly: {
 //                validators: {
 //                    notEmpty: {
 //                        message: 'This field is required and cannot be empty'
 //                    },
 //                    numeric: {
 //                        message: 'Must be a number'
 //                    }
 //                }
 //            },
 //            iCPTransactions: {
 //                validators: {
 //                    notEmpty: {
 //                        message: 'This field is required and cannot be empty'
 //                    },
 //                    numeric: {
 //                        message: 'Must be a number'
 //                    }
 //                }
 //            },
 //            iMonthlySales: {
 //                validators: {
 //                    notEmpty: {
 //                        message: 'This field is required and cannot be empty'
 //                    },
 //                    numeric: {
 //                        message: 'Must be a number'
 //                    }
 //                }
 //            },
 //            iMonthlyTransactions: {
 //            	validators: {
 //            		notEmpty: {
 //            			message: 'This field is required and cannot be empty'
 //            		},
 //            		numeric: {
 //            			message: 'Must be a valid Number'
 //            		}
 //            	}
 //            },
 //            iAverageTicket: {
 //            	validators: {
 //            		notEmpty: {
 //            			message: 'This field is required and cannot be empty'
 //            		},
 //            		numeric: {
 //            			message: 'Must be a valid Number'
 //            		}
 //            	}
 //            }
 //        }
 //    });
});
//]]>
