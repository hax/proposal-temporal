import { ES } from './ecmascript.mjs';
import { MakeIntrinsicClass } from './intrinsicclass.mjs';
import { datetime as STRING } from './regex.mjs';

import {
  YEAR,
  MONTH,
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLISECOND,
  MICROSECOND,
  NANOSECOND,
  CreateSlots,
  GetSlot,
  SetSlot
} from './slots.mjs';

export class DateTime {
  constructor(
    year,
    month,
    day,
    hour,
    minute,
    second = 0,
    millisecond = 0,
    microsecond = 0,
    nanosecond = 0,
    disambiguation = 'constrain'
  ) {
    year = ES.ToInteger(year);
    month = ES.ToInteger(month);
    day = ES.ToInteger(day);
    hour = ES.ToInteger(hour);
    minute = ES.ToInteger(minute);
    second = ES.ToInteger(second);
    millisecond = ES.ToInteger(millisecond);
    microsecond = ES.ToInteger(microsecond);
    nanosecond = ES.ToInteger(nanosecond);
    switch (disambiguation) {
      case 'constrain':
        ({ year, month, day } = ES.ConstrainDate(year, month, day));
        ({ hour, minute, second, millisecond, microsecond, nanosecond } = ES.ConstrainTime(
          hour,
          minute,
          second,
          millisecond,
          microsecond,
          nanosecond
        ));
        break;
      case 'balance':
        ({ days, hour, minute, second, millisecond, microsecond, nanosecond } = ES.BalanceTime(
          hour,
          minute,
          second,
          millisecond,
          microsecond,
          nanosecond
        ));
        ({ year, month, day } = ES.BalanceDate(year, month, day + days));
        break;
      default:
        ES.RejectDate(year, month, day);
        ES.RejectTime(hour, minute, second, millisecond, microsecond, nanosecond);
    }

    CreateSlots(this);
    SetSlot(this, YEAR, year);
    SetSlot(this, MONTH, month);
    SetSlot(this, DAY, day);
    SetSlot(this, HOUR, hour);
    SetSlot(this, MINUTE, minute);
    SetSlot(this, SECOND, second);
    SetSlot(this, MILLISECOND, millisecond);
    SetSlot(this, MICROSECOND, microsecond);
    SetSlot(this, NANOSECOND, nanosecond);
  }
  get year() {
    return GetSlot(this, YEAR);
  }
  get month() {
    return GetSlot(this, MONTH);
  }
  get day() {
    return GetSlot(this, DAY);
  }
  get hour() {
    return GetSlot(this, HOUR);
  }
  get minute() {
    return GetSlot(this, MINUTE);
  }
  get second() {
    return GetSlot(this, SECOND);
  }
  get millisecond() {
    return GetSlot(this, MILLISECOND);
  }
  get microsecond() {
    return GetSlot(this, MICROSECOND);
  }
  get nanosecond() {
    return GetSlot(this, NANOSECOND);
  }
  get dayOfWeek() {
    return ES.DayOfWeek(GetSlot(this, YEAR), GetSlot(this, MONTH), GetSlot(this, DAY));
  }
  get dayOfYear() {
    return ES.DayOfYear(GetSlot(this, YEAR), GetSlot(this, MONTH), GetSlot(this, DAY));
  }
  get weekOfYear() {
    return ES.WeekOfYear(GetSlot(this, YEAR), GetSlot(this, MONTH), GetSlot(this, DAY));
  }
  get daysInYear() {
    return ES.LeapYear(GetSlot(this, YEAR)) ? 366 : 365;
  }
  get daysInMonth() {
    return ES.DaysInMonth(GetSlot(this, YEAR), GetSlot(this, MONTH));
  }
  get leapYear() {
    return ES.LeapYear(GetSlot(this, YEAR));
  }
  with(dateTimeLike = {}, disambiguation = 'constrain') {
    if (!ES.ValidPropertyBag(dateTimeLike, [ 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond', 'microsecond', 'nanosecond' ])) {
      throw new RangeError('invalid date-time-like');
    }
    const {
      year = GetSlot(this, YEAR),
      month = GetSlot(this, MONTH),
      day = GetSlot(this, DAY),
      hour = GetSlot(this, HOUR),
      minute = GetSlot(this, MINUTE),
      second = GetSlot(this, SECOND),
      millisecond = GetSlot(this, MILLISECOND),
      microsecond = GetSlot(this, MICROSECOND),
      nanosecond = GetSlot(this, NANOSECOND)
    } = dateTimeLike;
    const Construct = ES.SpeciesConstructor(this, DateTime);
    return new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, disambiguation);
  }
  plus(durationLike = {}, disambiguation = 'constrain') {
    const duration = ES.CastDuration(durationLike);
    if (!ES.ValidPropertyBag(duration, [ 'years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds', 'nanoseconds' ])) {
      throw new RangeError('invalid duration');
    }
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = this;
    const { years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    ({ year, month, day } = ES.AddDate(year, month, day, years, months, days, disambiguation));
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.AddTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    ));
    day += deltaDays;
    ({ year, month, day } = ES.BalanceDate(year, month, day));
    const Construct = ES.SpeciesConstructor(this, DateTime);
    return new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
  }
  minus(durationLike = {}, disambiguation = 'constrain') {
    const duration = ES.CastDuration(durationLike);
    if (!ES.ValidPropertyBag(duration, [ 'years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds', 'nanoseconds' ])) {
      throw new RangeError('invalid duration');
    }
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = this;
    const { years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.SubtractTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    ));
    days += deltaDays;
    ({ year, month, day } = ES.SubtractDate(year, month, day, years, months, days, disambiguation));
    const Construct = ES.SpeciesConstructor(this, DateTime);
    return new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
  }
  difference(other) {
    other = ES.CastDateTime(other);
    const [smaller, larger] = [this, other].sort(DateTime.compare);
    const { deltaDays, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.DifferenceTime(
      smaller,
      larger
    );
    let { year, month, day } = larger;
    day += deltaDays;
    ({ year, month, day } = ES.BalanceDate(year, month, day));
    let { years, months, days } = ES.DifferenceDate(smaller, { year, month, day });

    const Duration = ES.GetIntrinsic('%Temporal.Duration%');
    return new Duration(years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds);
  }
  toString() {
    let year = ES.ISOYearString(GetSlot(this, YEAR));
    let month = ES.ISODateTimePartString(GetSlot(this, MONTH));
    let day = ES.ISODateTimePartString(GetSlot(this, DAY));
    let hour = ES.ISODateTimePartString(GetSlot(this, HOUR));
    let minute = ES.ISODateTimePartString(GetSlot(this, MINUTE));
    let second = ES.ISOSecondsString(
      GetSlot(this, SECOND),
      GetSlot(this, MILLISECOND),
      GetSlot(this, MICROSECOND),
      GetSlot(this, NANOSECOND)
    );
    let resultString = `${year}-${month}-${day}T${hour}:${minute}${second ? `:${second}` : ''}`;
    return resultString;
  }
  toLocaleString(...args) {
    return new Intl.DateTimeFormat(...args).format(this);
  }

  inZone(timeZoneParam = 'UTC', disambiguation = 'earlier') {
    const timeZone = ES.CastTimeZone(timeZoneParam);
    return timeZone.getAbsoluteFor(this, disambiguation);
  }
  getDate() {
    const Date = ES.GetIntrinsic('%Temporal.Date%');
    return new Date(GetSlot(this, YEAR), GetSlot(this, MONTH), GetSlot(this, DAY));
  }
  getYearMonth() {
    const YearMonth = ES.GetIntrinsic('%Temporal.YearMonth%');
    return new YearMonth(GetSlot(this, YEAR), GetSlot(this, MONTH));
  }
  getMonthDay() {
    const MonthDay = ES.GetIntrinsic('%Temporal.MonthDay%');
    return new MonthDay(GetSlot(this, MONTH), GetSlot(this, DAY));
  }
  getTime() {
    const Time = ES.GetIntrinsic('%Temporal.Time%');
    return new Time(
      GetSlot(this, HOUR),
      GetSlot(this, MINUTE),
      GetSlot(this, SECOND),
      GetSlot(this, MILLISECOND),
      GetSlot(this, MICROSECOND),
      GetSlot(this, NANOSECOND)
    );
  }

  static fromString(isoString) {
    isoString = ES.ToString(isoString);
    const match = STRING.exec(isoString);
    if (!match) throw new RangeError(`invalid datetime: ${isoString}`);
    const year = ES.ToInteger(match[1]);
    const month = ES.ToInteger(match[2]);
    const day = ES.ToInteger(match[3]);
    const hour = ES.ToInteger(match[4]);
    const minute = ES.ToInteger(match[5]);
    const second = ES.ToInteger(match[6]);
    const millisecond = ES.ToInteger(match[7]);
    const microsecond = ES.ToInteger(match[8]);
    const nanosecond = ES.ToInteger(match[9]);
    const DateTime = ES.GetIntrinsic('%Temporal.DateTime%');
    return new DateTime(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, 'reject');
  }
  static from(...args) {
    return ES.CastDateTime(...args);
  }
  static compare(one, two) {
    one = ES.CastDateTime(one);
    two = ES.CastDateTime(two);
    if (one.year !== two.year) return ES.ComparisonResult(one.year - two.year);
    if (one.month !== two.month) return ES.ComparisonResult(one.month - two.month);
    if (one.day !== two.day) return ES.ComparisonResult(one.day - two.day);
    if (one.hour !== two.hour) return ES.ComparisonResult(one.hour - two.hour);
    if (one.minute !== two.minute) return ES.ComparisonResult(one.minute - two.minute);
    if (one.second !== two.second) return ES.ComparisonResult(one.second - two.second);
    if (one.millisecond !== two.millisecond) return ES.ComparisonResult(one.millisecond - two.millisecond);
    if (one.microsecond !== two.microsecond) return ES.ComparisonResult(one.microsecond - two.microsecond);
    if (one.nanosecond !== two.nanosecond) return ES.ComparisonResult(one.nanosecond - two.nanosecond);
    return ES.ComparisonResult(0);
  }
}
DateTime.prototype.toJSON = DateTime.prototype.toString;

MakeIntrinsicClass(DateTime, 'Temporal.DateTime');
