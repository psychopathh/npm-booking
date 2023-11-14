const sortForObjectOrZone = ({
  objectFilter,
  zoneFilter,
  arr,
  zones,
  category,
}) => {
  if (objectFilter === "desc") {
    const sorted = arr?.sort((a, b) => {
      return Number.isNaN(+a?.name) || Number.isNaN(+b?.name)
        ? a?.name?.localeCompare(b?.name)
        : a?.name - b?.name;
    });
    return sorted;
  }
  if (objectFilter === "asc") {
    const sorted = arr?.sort((a, b) => {
      return Number.isNaN(+b?.name) || Number.isNaN(+a?.name)
        ? b?.name?.localeCompare(a?.name)
        : b?.name - a?.name;
    });
    return sorted;
  }
  if (zoneFilter === "desc") {
    const zonesArr = arr?.map((item) => {
      return {
        ...item,
        item_zone: zones.find((el) => el.id === item?.zone_id),
      };
    });
    const sorted = zonesArr?.sort((a, b) => {
      return Number.isNaN(+a?.item_zone?.name) ||
        Number.isNaN(+b?.item_zone?.name)
        ? a?.item_zone?.name?.localeCompare(b?.item_zone?.name)
        : a?.item_zone?.name - b?.item_zone?.name;
    });
    return sorted;
  }
  if (zoneFilter === "asc") {
    const zonesArr = arr?.map((item) => {
      return {
        ...item,
        item_zone: zones.find((el) => el.id === item?.zone_id),
      };
    });
    const sorted = zonesArr?.sort((a, b) => {
      return Number.isNaN(+b?.item_zone?.name) ||
        Number.isNaN(+a?.item_zone?.name)
        ? b?.item_zone?.name?.localeCompare(a?.item_zone?.name)
        : b?.item_zone?.name - a?.item_zone?.name;
    });
    return sorted;
  }
};

export default sortForObjectOrZone;
