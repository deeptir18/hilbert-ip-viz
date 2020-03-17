// convert the ip address to a decimal
// assumes dotted decimal format for input
function convertIpToDecimal(ip) {
        // a not-perfect regex for checking a valid ip address
	// It checks for (1) 4 numbers between 0 and 3 digits each separated by dots (IPv4)
	// or (2) 6 numbers between 0 and 3 digits each separated by dots (IPv6)
	var ipAddressRegEx = /^(\d{0,3}\.){3}.(\d{0,3})$|^(\d{0,3}\.){5}.(\d{0,3})$/;
	var valid = ipAddressRegEx.test(ip);
	if (!valid) {
		return false;
	}
	var dots = ip.split('.');
	// make sure each value is between 0 and 255
	for (var i = 0; i < dots.length; i++) {
		var dot = dots[i];
		if (dot > 255 || dot < 0) {
			return false;
		}
	}
	if (dots.length == 4) {
		// IPv4
		return ((((((+dots[0])*256)+(+dots[1]))*256)+(+dots[2]))*256)+(+dots[3]);
	} else if 
    (dots.length == 6) {
		// IPv6
		return ((((((((+dots[0])*256)+(+dots[1]))*256)+(+dots[2]))*256)+(+dots[3])*256)+(+dots[4])*256)+(+dots[5]);
	}
	return false;
}
function parseIPData(ipdata) {
    var ips = [];
    count = 0;
    // count the number of IPs per AS and manually calculate a range
    currentASN = null;
    currentCount = 0;
    currentMin = Infinity;
    currentMax = 0;
    ASNmap = new Map(); // maps ASN to {count: X, start: X, end: X} (hopefully not overlapping)
    while (count < ipdata.length) {
        line = ipdata[count];
        currentASN = +line.ASN;

        if (ASNmap.has(currentASN)) {
            obj = ASNmap.get(currentASN)
            obj.start = Math.min(obj.start, convertIpToDecimal(line.ip));
            obj.end = Math.max(obj.end, convertIpToDecimal(line.ip));
            obj.length = obj.end - obj.start + 1;
            obj.count += 1;
            ASNmap.set(currentASN, obj);
            console.log(currentASN, obj.count);
        } else {
            obj = {
                start:  convertIpToDecimal(line.ip),
                length: 1,
                end: convertIpToDecimal(line.ip),
                count: 1,
                asn: currentASN,
                name: line.ip,
            };
            ASNmap.set(currentASN, obj);
        }
        count += 1;
    }
    
    ASNmap.forEach(function(v, k) {
        ips.push(v);
    });
    console.log(ips.length);
    return ips;
}
function ipFormatter(d) {
    return new Ip.Addr(d).toString();
}

